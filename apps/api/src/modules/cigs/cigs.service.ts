import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Cig } from './cig.entity';
import { CigMeeting } from './cig-meeting.entity';
import { CigDocument, CigDocumentCategory } from './cig-document.entity';
import { Member } from '../members/member.entity';
import type { CreateCigDto } from './dto/create-cig.dto';
import type { UpdateCigDto } from './dto/update-cig.dto';
import type { CreateMeetingDto } from './dto/create-meeting.dto';
import type { CreateCigDocumentDto } from './dto/create-document.dto';

@Injectable()
export class CigsService {
  constructor(
    @InjectRepository(Cig)
    private readonly cigRepo: Repository<Cig>,
    @InjectRepository(CigMeeting)
    private readonly meetingRepo: Repository<CigMeeting>,
    @InjectRepository(CigDocument)
    private readonly docRepo: Repository<CigDocument>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
  ) {}

  // ─── CIG CRUD ─────────────────────────────────────────────────────────────

  async create(dto: CreateCigDto): Promise<Cig> {
    const existing = await this.cigRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`A CIG named "${dto.name}" already exists`);

    const cig = this.cigRepo.create(dto);
    return this.cigRepo.save(cig);
  }

  async findAll(search?: string): Promise<Cig[]> {
    const qb = this.cigRepo
      .createQueryBuilder('c')
      .loadRelationCountAndMap('c.memberCount', 'c.members')
      .orderBy('c.name', 'ASC');

    if (search) {
      qb.where('c.name ILIKE :s OR c.subLocation ILIKE :s', { s: `%${search}%` });
    }

    return qb.getMany();
  }

  async findById(id: string): Promise<Cig> {
    const cig = await this.cigRepo.findOne({
      where: { id },
      relations: ['members'],
    });
    if (!cig) throw new NotFoundException('CIG not found');
    return cig;
  }

  async update(id: string, dto: UpdateCigDto): Promise<Cig> {
    const cig = await this.findById(id);
    if (dto.name && dto.name !== cig.name) {
      const clash = await this.cigRepo.findOne({ where: { name: dto.name } });
      if (clash) throw new ConflictException(`A CIG named "${dto.name}" already exists`);
    }
    Object.assign(cig, dto);
    return this.cigRepo.save(cig);
  }

  async remove(id: string): Promise<void> {
    const cig = await this.findById(id);
    await this.cigRepo.remove(cig);
  }

  // ─── Membership ───────────────────────────────────────────────────────────

  async addMember(cigId: string, memberId: string): Promise<Cig> {
    const cig = await this.findById(cigId);
    const member = await this.memberRepo.findOne({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');

    const already = cig.members?.some((m) => m.id === memberId);
    if (already) throw new ConflictException('Member is already in this CIG');

    cig.members = [...(cig.members ?? []), member];
    return this.cigRepo.save(cig);
  }

  async removeMember(cigId: string, memberId: string): Promise<Cig> {
    const cig = await this.findById(cigId);
    cig.members = (cig.members ?? []).filter((m) => m.id !== memberId);
    return this.cigRepo.save(cig);
  }

  async getMembers(cigId: string): Promise<Member[]> {
    const cig = await this.findById(cigId);
    return cig.members ?? [];
  }

  // ─── Meetings ─────────────────────────────────────────────────────────────

  async createMeeting(
    cigId: string,
    dto: CreateMeetingDto,
    userId: string,
  ): Promise<CigMeeting> {
    await this.findById(cigId); // ensure CIG exists
    const meeting = this.meetingRepo.create({
      ...dto,
      cigId,
      recordedBy: userId,
    });
    return this.meetingRepo.save(meeting);
  }

  async getMeetings(cigId: string): Promise<CigMeeting[]> {
    return this.meetingRepo.find({
      where: { cigId },
      order: { date: 'DESC' },
    });
  }

  async updateMeeting(
    meetingId: string,
    dto: Partial<CreateMeetingDto>,
  ): Promise<CigMeeting> {
    const meeting = await this.meetingRepo.findOne({ where: { id: meetingId } });
    if (!meeting) throw new NotFoundException('Meeting not found');
    Object.assign(meeting, dto);
    return this.meetingRepo.save(meeting);
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    const meeting = await this.meetingRepo.findOne({ where: { id: meetingId } });
    if (!meeting) throw new NotFoundException('Meeting not found');
    await this.meetingRepo.remove(meeting);
  }

  // ─── Documents ────────────────────────────────────────────────────────────

  async createDocument(
    cigId: string,
    dto: CreateCigDocumentDto,
    fileUrl: string,
    fileSize: number | null,
    mimeType: string | null,
    userId: string,
  ): Promise<CigDocument> {
    await this.findById(cigId);
    const doc = this.docRepo.create({
      cigId,
      name: dto.name,
      category: dto.category ?? CigDocumentCategory.OTHER,
      year: dto.year ?? new Date().getFullYear(),
      description: dto.description ?? null,
      fileUrl,
      fileSize,
      mimeType,
      uploadedBy: userId,
    });
    return this.docRepo.save(doc);
  }

  async getDocuments(cigId: string): Promise<CigDocument[]> {
    return this.docRepo.find({
      where: { cigId },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteDocument(docId: string): Promise<void> {
    const doc = await this.docRepo.findOne({ where: { id: docId } });
    if (!doc) throw new NotFoundException('Document not found');
    await this.docRepo.remove(doc);
  }

  // ─── Serialisers ──────────────────────────────────────────────────────────

  toDto(cig: Cig) {
    return {
      id: cig.id,
      name: cig.name,
      type: cig.type,
      registrationDate: cig.registrationDate,
      subLocation: cig.subLocation,
      chairpersonMemberId: cig.chairpersonMemberId,
      secretaryMemberId: cig.secretaryMemberId,
      treasurerMemberId: cig.treasurerMemberId,
      memberCount: (cig as Cig & { memberCount?: number }).memberCount ?? cig.members?.length ?? 0,
      createdAt: cig.createdAt.toISOString(),
    };
  }

  docToDto(d: CigDocument) {
    return {
      id: d.id,
      cigId: d.cigId,
      name: d.name,
      category: d.category,
      year: d.year,
      description: d.description,
      fileUrl: d.fileUrl,
      fileSize: d.fileSize,
      mimeType: d.mimeType,
      uploadedBy: d.uploadedBy,
      createdAt: d.createdAt.toISOString(),
    };
  }

  meetingToDto(m: CigMeeting) {
    return {
      id: m.id,
      cigId: m.cigId,
      date: m.date,
      agenda: m.agenda,
      minutes: m.minutes,
      actionItems: m.actionItems,
      attendanceCount: m.attendanceCount,
      venue: m.venue,
      recordedBy: m.recordedBy,
      createdAt: m.createdAt.toISOString(),
    };
  }
}
