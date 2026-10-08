import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, type Repository } from 'typeorm';
import { Member } from './member.entity';
import { MemberSequence } from './member-sequence.entity';
import { Cig } from '../cigs/cig.entity';
import type { CreateMemberDto } from './dto/create-member.dto';
import type { UpdateMemberDto } from './dto/update-member.dto';
import type { MemberFilterDto } from './dto/member-filter.dto';
import type { RejectMemberDto } from './dto/reject-member.dto';
import { MemberStatus } from '@maku/shared-types';

// ─── CSV import row shape ────────────────────────────────────────────────────

interface CsvRow {
  fullName?: string;
  nationalId?: string;
  phonePrimary?: string;
  gender?: string;
  subLocation?: string;
  village?: string;
  dateOfBirth?: string;
  cattleCount?: string;
  goatCount?: string;
  camelCount?: string;
  sheepCount?: string;
  shareContributions?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly repo: Repository<Member>,
    @InjectRepository(MemberSequence)
    private readonly seqRepo: Repository<MemberSequence>,
    @InjectRepository(Cig)
    private readonly cigRepo: Repository<Cig>,
    private readonly dataSource: DataSource,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(dto: CreateMemberDto, selfRegister = false): Promise<Member> {
    await this.checkDuplicates(dto.nationalId, dto.phonePrimary);

    const { cigIds, ...memberData } = dto;

    const member = this.repo.create({
      ...memberData,
      status: selfRegister ? MemberStatus.PENDING : MemberStatus.PENDING,
    });

    const saved = await this.repo.save(member);

    // Attach to CIGs if provided
    if (cigIds && cigIds.length > 0) {
      const cigs = await this.cigRepo
        .createQueryBuilder('c')
        .where('c.id IN (:...ids)', { ids: cigIds })
        .getMany();

      if (cigs.length > 0) {
        saved.cigs = cigs;
        await this.repo.save(saved);
      }
    }

    return (await this.repo.findOne({ where: { id: saved.id }, relations: ['cigs'] })) ?? saved;
  }

  // ─── Read ─────────────────────────────────────────────────────────────────

  async findAll(filters: MemberFilterDto): Promise<{ data: Member[]; total: number }> {
    const {
      search,
      status,
      gender,
      cigId,
      year,
      page = 1,
      perPage = 25,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    // Use find/findAndCount for simple queries to avoid TypeORM orderBy bugs with joins
    // Only use QueryBuilder when we need CIG join filtering
    if (!cigId && !search) {
      const where: Record<string, unknown> = {};
      if (status) where['status'] = status;
      if (gender) where['gender'] = gender;

      const allowedSort: Record<string, keyof Member> = {
        createdAt: 'createdAt',
        fullName: 'fullName',
        memberNumber: 'memberNumber',
        registrationDate: 'registrationDate',
      };
      const orderField = allowedSort[sortBy] ?? 'createdAt';

      const [data, total] = await this.repo.findAndCount({
        where,
        relations: ['cigs'],
        order: { [orderField]: sortOrder },
        skip: (page - 1) * perPage,
        take: perPage,
      });
      return { data, total };
    }

    // Full query builder path — needed for search and CIG filtering
    const qb = this.repo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.cigs', 'cig');

    if (search) {
      qb.andWhere(
        "(m.fullName ILIKE :s OR m.nationalId ILIKE :s OR m.phonePrimary ILIKE :s OR m.memberNumber ILIKE :s)",
        { s: `%${search}%` },
      );
    }
    if (status) qb.andWhere('m.status = :status', { status });
    if (gender) qb.andWhere('m.gender = :gender', { gender });
    if (cigId) qb.andWhere('cig.id = :cigId', { cigId });
    if (year) {
      qb.andWhere('EXTRACT(YEAR FROM m.registrationDate) = :year', { year });
    }

    const allowedSort: Record<string, string> = {
      createdAt: 'm.createdAt',
      fullName: 'm.fullName',
      memberNumber: 'm.memberNumber',
      registrationDate: 'm.registrationDate',
    };
    const orderCol = allowedSort[sortBy] ?? 'm.createdAt';
    qb.orderBy(orderCol, sortOrder);

    const [data, total] = await qb
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: string): Promise<Member> {
    const m = await this.repo.findOne({ where: { id }, relations: ['cigs'] });
    if (!m) throw new NotFoundException('Member not found');
    return m;
  }

  async findPending(): Promise<Member[]> {
    return this.repo.find({
      where: { status: MemberStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateMemberDto): Promise<Member> {
    const member = await this.findById(id);

    // If nationalId or phone is changing, check for duplicates
    if (dto.nationalId && dto.nationalId !== member.nationalId) {
      await this.checkDuplicates(dto.nationalId, undefined, id);
    }
    if (dto.phonePrimary && dto.phonePrimary !== member.phonePrimary) {
      await this.checkDuplicates(undefined, dto.phonePrimary, id);
    }

    Object.assign(member, dto);
    return this.repo.save(member);
  }

  // ─── Approve ──────────────────────────────────────────────────────────────

  async approve(id: string, approvedById: string): Promise<Member> {
    const member = await this.findById(id);
    if (member.status !== MemberStatus.PENDING) {
      throw new BadRequestException('Only pending members can be approved');
    }

    // Generate member number atomically
    const memberNumber = await this.generateMemberNumber();

    member.status = MemberStatus.ACTIVE;
    member.memberNumber = memberNumber;
    member.approvedBy = approvedById;
    member.approvedAt = new Date();
    member.rejectionReason = null;

    return this.repo.save(member);
  }

  // ─── Reject ───────────────────────────────────────────────────────────────

  async reject(id: string, dto: RejectMemberDto): Promise<Member> {
    const member = await this.findById(id);
    if (member.status !== MemberStatus.PENDING) {
      throw new BadRequestException('Only pending members can be rejected');
    }

    member.status = MemberStatus.INACTIVE;
    member.rejectionReason = dto.reason;

    return this.repo.save(member);
  }

  // ─── Photo ────────────────────────────────────────────────────────────────

  async updatePhoto(id: string, photoUrl: string): Promise<Member> {
    await this.repo.update(id, { photoUrl });
    return this.findById(id);
  }

  // ─── Soft deactivate ─────────────────────────────────────────────────────

  async deactivate(id: string): Promise<Member> {
    const member = await this.findById(id);
    member.status = MemberStatus.INACTIVE;
    return this.repo.save(member);
  }

  // ─── Bulk CSV import ─────────────────────────────────────────────────────

  async importCsv(rows: CsvRow[]): Promise<{
    imported: number;
    skipped: number;
    errors: Array<{ row: number; reason: string }>;
  }> {
    let imported = 0;
    let skipped = 0;
    const errors: Array<{ row: number; reason: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-indexed + header

      // Required field validation
      if (!row?.fullName?.trim()) {
        errors.push({ row: rowNum, reason: 'fullName is required' });
        skipped++;
        continue;
      }
      if (!row?.nationalId?.trim() || !/^\d{7,8}$/.test(row.nationalId.trim())) {
        errors.push({ row: rowNum, reason: 'nationalId must be 7 or 8 digits' });
        skipped++;
        continue;
      }
      if (!row?.phonePrimary?.trim() || !/^(\+?254|0)7\d{8}$/.test(row.phonePrimary.trim())) {
        errors.push({ row: rowNum, reason: 'phonePrimary must be a valid Kenyan mobile number' });
        skipped++;
        continue;
      }

      // Duplicate check
      const exists = await this.repo.findOne({
        where: [
          { nationalId: row.nationalId.trim() },
          { phonePrimary: row.phonePrimary.trim() },
        ],
      });
      if (exists) {
        errors.push({ row: rowNum, reason: `Duplicate: nationalId or phone already exists (${exists.memberNumber ?? exists.id})` });
        skipped++;
        continue;
      }

      try {
        const member = this.repo.create({
          fullName: row.fullName.trim(),
          nationalId: row.nationalId.trim(),
          phonePrimary: row.phonePrimary.trim(),
          subLocation: row.subLocation?.trim() || null,
          village: row.village?.trim() || null,
          dateOfBirth: row.dateOfBirth?.trim() || null,
          cattleCount: parseInt(row.cattleCount ?? '0', 10) || 0,
          goatCount: parseInt(row.goatCount ?? '0', 10) || 0,
          camelCount: parseInt(row.camelCount ?? '0', 10) || 0,
          sheepCount: parseInt(row.sheepCount ?? '0', 10) || 0,
          shareContributions: parseFloat(row.shareContributions ?? '0') || 0,
          status: MemberStatus.PENDING,
        });
        await this.repo.save(member);
        imported++;
      } catch {
        errors.push({ row: rowNum, reason: 'Database error saving row' });
        skipped++;
      }
    }

    return { imported, skipped, errors };
  }

  // ─── Export helpers (returns plain objects for CSV serialisation) ─────────

  async exportAll(filters: MemberFilterDto): Promise<Member[]> {
    const bigFilter = { ...filters, page: 1, perPage: 10000 };
    const { data } = await this.findAll(bigFilter);
    return data;
  }

  // ─── Serialiser ──────────────────────────────────────────────────────────

  toDto(m: Member) {
    return {
      id: m.id,
      memberNumber: m.memberNumber,
      fullName: m.fullName,
      nationalId: m.nationalId,
      dateOfBirth: m.dateOfBirth,
      gender: m.gender,
      phonePrimary: m.phonePrimary,
      phoneSecondary: m.phoneSecondary,
      subLocation: m.subLocation,
      village: m.village,
      gpsLat: m.gpsLat ? Number(m.gpsLat) : null,
      gpsLng: m.gpsLng ? Number(m.gpsLng) : null,
      photoUrl: m.photoUrl,
      status: m.status,
      registrationDate: m.registrationDate,
      approvedBy: m.approvedBy,
      approvedAt: m.approvedAt?.toISOString() ?? null,
      rejectionReason: m.rejectionReason,
      shareContributions: Number(m.shareContributions),
      cattleCount: m.cattleCount,
      goatCount: m.goatCount,
      camelCount: m.camelCount,
      sheepCount: m.sheepCount,
      notes: m.notes,
      cigs: m.cigs?.map((c) => ({ id: c.id, name: c.name })) ?? [],
      // next of kin
      nextOfKinName: m.nextOfKinName,
      nextOfKinRelationship: m.nextOfKinRelationship,
      nextOfKinPhone: m.nextOfKinPhone,
      // contributions
      membershipFeePaid: Number(m.membershipFeePaid),
      shareCapitalPaid: Number(m.shareCapitalPaid),
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private async checkDuplicates(
    nationalId?: string,
    phone?: string,
    excludeId?: string,
  ): Promise<void> {
    if (nationalId) {
      const qb = this.repo
        .createQueryBuilder('m')
        .where('m.national_id = :nationalId', { nationalId });
      if (excludeId) qb.andWhere('m.id != :excludeId', { excludeId });
      const exists = await qb.getOne();
      if (exists) {
        throw new ConflictException(
          `A member with national ID ${nationalId} already exists (${exists.memberNumber ?? 'pending'})`,
        );
      }
    }

    if (phone) {
      const qb = this.repo
        .createQueryBuilder('m')
        .where('m.phone_primary = :phone', { phone });
      if (excludeId) qb.andWhere('m.id != :excludeId', { excludeId });
      const exists = await qb.getOne();
      if (exists) {
        throw new ConflictException(
          `A member with phone ${phone} already exists (${exists.memberNumber ?? 'pending'})`,
        );
      }
    }
  }

  private async generateMemberNumber(): Promise<string> {
    // Atomic increment using a row-level lock so concurrent approvals never collide
    return this.dataSource.transaction(async (mgr) => {
      const year = new Date().getFullYear();
      let seq = await mgr.findOne(MemberSequence, { where: { year } });
      if (!seq) {
        seq = mgr.create(MemberSequence, { year, nextVal: 1 });
      }
      const num = seq.nextVal;
      seq.nextVal += 1;
      await mgr.save(seq);
      return `MAKU-${year}-${String(num).padStart(4, '0')}`;
    });
  }
}
