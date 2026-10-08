import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { PurchaseTransaction, PurchaseType } from './purchase-transaction.entity';
import type { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(PurchaseTransaction) private readonly repo: Repository<PurchaseTransaction>,
  ) {}

  private async genRef(type: PurchaseType): Promise<string> {
    const prefix = type === PurchaseType.PURCHASE ? 'PO' : 'SO';
    const year = new Date().getFullYear();
    const count = await this.repo.count();
    return `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async create(dto: CreatePurchaseDto, userId: string): Promise<PurchaseTransaction> {
    const referenceNumber = await this.genRef(dto.type);
    const subtotal  = dto.lineItems.reduce((s, l) => s + l.total, 0);
    const taxAmount = dto.taxAmount ?? 0;
    const totalAmount = subtotal + taxAmount;

    const tx = this.repo.create({
      ...dto, referenceNumber, subtotal, taxAmount, totalAmount,
      amountPaid: 0, recordedBy: userId,
    });
    return this.repo.save(tx);
  }

  async findAll(filters: {
    type?: string; supplierId?: string; memberId?: string;
    from?: string; to?: string; page?: number; perPage?: number;
  }): Promise<{ data: PurchaseTransaction[]; total: number }> {
    const { type, supplierId, memberId, from, to, page = 1, perPage = 25 } = filters;
    const qb = this.repo.createQueryBuilder('t').orderBy('t.transactionDate', 'DESC');
    if (type)       qb.andWhere('t.type = :type', { type });
    if (supplierId) qb.andWhere('t.supplierId = :supplierId', { supplierId });
    if (memberId)   qb.andWhere('t.memberId = :memberId', { memberId });
    if (from)       qb.andWhere('t.transactionDate >= :from', { from });
    if (to)         qb.andWhere('t.transactionDate <= :to', { to });
    const [data, total] = await qb.skip((page - 1) * perPage).take(perPage).getManyAndCount();
    return { data, total };
  }

  async findById(id: string): Promise<PurchaseTransaction> {
    const t = await this.repo.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Transaction not found');
    return t;
  }

  async recordPayment(id: string, amount: number): Promise<PurchaseTransaction> {
    const t = await this.findById(id);
    t.amountPaid = Number(t.amountPaid) + amount;
    if (Number(t.amountPaid) >= Number(t.totalAmount)) t.status = 'paid' as never;
    return this.repo.save(t);
  }

  async getSummary() {
    const [purchases, sales] = await Promise.all([
      this.repo.createQueryBuilder('t')
        .select('SUM(t.total_amount)', 'total').addSelect('COUNT(*)', 'count')
        .where('t.type = :t', { t: PurchaseType.PURCHASE }).getRawOne<{ total: string; count: string }>(),
      this.repo.createQueryBuilder('t')
        .select('SUM(t.total_amount)', 'total').addSelect('COUNT(*)', 'count')
        .where('t.type = :t', { t: PurchaseType.SALE }).getRawOne<{ total: string; count: string }>(),
    ]);
    return {
      purchases: { count: parseInt(purchases?.count ?? '0', 10), total: parseFloat(purchases?.total ?? '0') },
      sales:     { count: parseInt(sales?.count ?? '0', 10),     total: parseFloat(sales?.total ?? '0') },
    };
  }

  toDto(t: PurchaseTransaction) {
    return {
      id: t.id, referenceNumber: t.referenceNumber,
      transactionDate: t.transactionDate, type: t.type, status: t.status,
      supplierId: t.supplierId, buyerName: t.buyerName, memberId: t.memberId,
      description: t.description, lineItems: t.lineItems,
      subtotal: Number(t.subtotal), taxAmount: Number(t.taxAmount),
      totalAmount: Number(t.totalAmount), amountPaid: Number(t.amountPaid),
      paymentMethod: t.paymentMethod, paymentReference: t.paymentReference,
      dueDate: t.dueDate, recordedBy: t.recordedBy, notes: t.notes,
      createdAt: t.createdAt.toISOString(),
    };
  }
}
