import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { ProcurementOrder, ProcurementStatus } from './procurement-order.entity';
import type { CreateProcurementDto } from './dto/create-procurement.dto';

@Injectable()
export class ProcurementService {
  constructor(
    @InjectRepository(ProcurementOrder) private readonly repo: Repository<ProcurementOrder>,
  ) {}

  private async genPO(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.repo.count();
    return `PR-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async create(dto: CreateProcurementDto, userId: string): Promise<ProcurementOrder> {
    const poNumber = await this.genPO();
    const order = this.repo.create({ ...dto, poNumber, requestedBy: userId });
    return this.repo.save(order);
  }

  async findAll(filters: {
    status?: string; supplierId?: string; page?: number; perPage?: number;
  }): Promise<{ data: ProcurementOrder[]; total: number }> {
    const { status, supplierId, page = 1, perPage = 25 } = filters;
    const qb = this.repo.createQueryBuilder('o').orderBy('o.requisitionDate', 'DESC');
    if (status)     qb.andWhere('o.status = :status', { status });
    if (supplierId) qb.andWhere('o.supplierId = :supplierId', { supplierId });
    const [data, total] = await qb.skip((page - 1) * perPage).take(perPage).getManyAndCount();
    return { data, total };
  }

  async findById(id: string): Promise<ProcurementOrder> {
    const o = await this.repo.findOne({ where: { id } });
    if (!o) throw new NotFoundException('Procurement order not found');
    return o;
  }

  async updateStatus(id: string, status: ProcurementStatus, userId: string): Promise<ProcurementOrder> {
    const o = await this.findById(id);
    o.status = status;
    if (status === ProcurementStatus.APPROVED) {
      o.approvedBy = userId;
      o.approvedDate = new Date().toISOString().slice(0, 10);
    }
    if (status === ProcurementStatus.RECEIVED) {
      o.deliveryDate = new Date().toISOString().slice(0, 10);
    }
    return this.repo.save(o);
  }

  async addQuote(id: string, quote: { supplier: string; amount: number; notes?: string }): Promise<ProcurementOrder> {
    const o = await this.findById(id);
    o.quotes = [...(o.quotes ?? []), quote];
    o.status = ProcurementStatus.QUOTING;
    return this.repo.save(o);
  }

  async getSummary() {
    const byStatus = await this.repo.createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(o.budget_amount)', 'budget')
      .groupBy('o.status')
      .getRawMany<{ status: string; count: string; budget: string }>();

    return {
      byStatus: byStatus.map((r) => ({
        status: r.status,
        count: parseInt(r.count, 10),
        budget: parseFloat(r.budget ?? '0'),
      })),
      totalOrders: byStatus.reduce((s, r) => s + parseInt(r.count, 10), 0),
      totalBudget: byStatus.reduce((s, r) => s + parseFloat(r.budget ?? '0'), 0),
    };
  }

  toDto(o: ProcurementOrder) {
    return {
      id: o.id, poNumber: o.poNumber, title: o.title, description: o.description,
      requisitionDate: o.requisitionDate, status: o.status,
      supplierId: o.supplierId, budgetAmount: Number(o.budgetAmount),
      actualAmount: o.actualAmount ? Number(o.actualAmount) : null,
      requiresQuotes: o.requiresQuotes, quotes: o.quotes,
      requestedBy: o.requestedBy, approvedBy: o.approvedBy,
      approvedDate: o.approvedDate, expectedDelivery: o.expectedDelivery,
      deliveryDate: o.deliveryDate, notes: o.notes,
      createdAt: o.createdAt.toISOString(),
    };
  }
}
