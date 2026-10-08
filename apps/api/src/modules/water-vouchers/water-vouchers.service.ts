import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { WaterVoucher, VoucherStatus } from './water-voucher.entity';
import type { CreateWaterVoucherDto } from './dto/create-voucher.dto';

@Injectable()
export class WaterVouchersService {
  constructor(
    @InjectRepository(WaterVoucher)
    private readonly repo: Repository<WaterVoucher>,
  ) {}

  // ── Auto-generate voucher number ────────────────────────────────────────
  private async generateVoucherNumber(): Promise<string> {
    const today = new Date();
    const prefix = `WV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    const count = await this.repo.count();
    return `${prefix}-${String(count + 1).padStart(5, '0')}`;
  }

  async create(dto: CreateWaterVoucherDto, userId: string): Promise<WaterVoucher> {
    const voucherNumber = await this.generateVoucherNumber();
    const costPerLitre = dto.costPerLitre ?? 0;
    const totalCost = costPerLitre * dto.litresAllocated;

    const voucher = this.repo.create({
      ...dto,
      voucherNumber,
      costPerLitre,
      totalCost,
      status: VoucherStatus.ISSUED,
      issuedBy: userId,
    });
    return this.repo.save(voucher);
  }

  async findAll(filters: {
    memberId?: string;
    cigId?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: number;
    perPage?: number;
  }): Promise<{ data: WaterVoucher[]; total: number }> {
    const { memberId, cigId, status, from, to, page = 1, perPage = 25 } = filters;
    const qb = this.repo.createQueryBuilder('v').orderBy('v.issueDate', 'DESC');

    if (memberId) qb.andWhere('v.memberId = :memberId', { memberId });
    if (cigId)    qb.andWhere('v.cigId = :cigId', { cigId });
    if (status)   qb.andWhere('v.status = :status', { status });
    if (from)     qb.andWhere('v.issueDate >= :from', { from });
    if (to)       qb.andWhere('v.issueDate <= :to', { to });

    const [data, total] = await qb
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: string): Promise<WaterVoucher> {
    const v = await this.repo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Voucher not found');
    return v;
  }

  async markUsed(id: string, litresUsed: number): Promise<WaterVoucher> {
    const v = await this.findById(id);
    v.litresUsed = litresUsed;
    v.status = VoucherStatus.USED;
    v.usedDate = new Date().toISOString().slice(0, 10);
    return this.repo.save(v);
  }

  async getSummary(from?: string, to?: string) {
    const qb = this.repo.createQueryBuilder('v');
    if (from) qb.andWhere('v.issueDate >= :from', { from });
    if (to)   qb.andWhere('v.issueDate <= :to', { to });
    const rows = await qb.getMany();

    return {
      totalIssued: rows.length,
      totalLitresAllocated: rows.reduce((s, r) => s + Number(r.litresAllocated), 0),
      totalLitresUsed:      rows.reduce((s, r) => s + Number(r.litresUsed), 0),
      totalCost:            rows.reduce((s, r) => s + Number(r.totalCost), 0),
      byStatus: {
        issued:    rows.filter((r) => r.status === VoucherStatus.ISSUED).length,
        used:      rows.filter((r) => r.status === VoucherStatus.USED).length,
        expired:   rows.filter((r) => r.status === VoucherStatus.EXPIRED).length,
        cancelled: rows.filter((r) => r.status === VoucherStatus.CANCELLED).length,
      },
    };
  }

  toDto(v: WaterVoucher) {
    return {
      id: v.id,
      voucherNumber: v.voucherNumber,
      memberId: v.memberId,
      litresAllocated: Number(v.litresAllocated),
      litresUsed: Number(v.litresUsed),
      boreholeName: v.boreholeName,
      costPerLitre: Number(v.costPerLitre),
      totalCost: Number(v.totalCost),
      issueDate: v.issueDate,
      expiryDate: v.expiryDate,
      usedDate: v.usedDate,
      status: v.status,
      cigId: v.cigId,
      issuedBy: v.issuedBy,
      notes: v.notes,
      createdAt: v.createdAt.toISOString(),
    };
  }
}
