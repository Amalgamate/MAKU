import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { CommodityTransaction, CommodityType } from './commodity-transaction.entity';
import type { CreateCommodityDto } from './dto/create-commodity.dto';

@Injectable()
export class CommoditiesService {
  constructor(@InjectRepository(CommodityTransaction) private readonly repo: Repository<CommodityTransaction>) {}

  async create(dto: CreateCommodityDto, userId: string): Promise<CommodityTransaction> {
    const totalAmount = (dto.unitPrice ?? 0) * dto.quantity;
    return this.repo.save(this.repo.create({ ...dto, totalAmount, recordedBy: userId, unit: dto.unit ?? 'kg' }));
  }

  async findAll(filters: { commodityType?: string; action?: string; memberId?: string; from?: string; to?: string; page?: number; perPage?: number; }): Promise<{ data: CommodityTransaction[]; total: number }> {
    const { commodityType, action, memberId, from, to, page = 1, perPage = 25 } = filters;
    const qb = this.repo.createQueryBuilder('t').orderBy('t.transactionDate', 'DESC');
    if (commodityType) qb.andWhere('t.commodityType = :ct', { ct: commodityType });
    if (action)        qb.andWhere('t.action = :action', { action });
    if (memberId)      qb.andWhere('t.memberId = :memberId', { memberId });
    if (from)          qb.andWhere('t.transactionDate >= :from', { from });
    if (to)            qb.andWhere('t.transactionDate <= :to', { to });
    const [data, total] = await qb.skip((page - 1) * perPage).take(perPage).getManyAndCount();
    return { data, total };
  }

  async getSummary(): Promise<Array<{ commodityType: string; collections: number; sales: number; totalQuantity: number; totalValue: number }>> {
    const rows = await this.repo.createQueryBuilder('t')
      .select('t.commodityType', 'commodityType')
      .addSelect(`SUM(CASE WHEN t.action = 'collection' THEN 1 ELSE 0 END)`, 'collections')
      .addSelect(`SUM(CASE WHEN t.action = 'sale' THEN 1 ELSE 0 END)`, 'sales')
      .addSelect('SUM(t.quantity)', 'totalQuantity')
      .addSelect('SUM(t.total_amount)', 'totalValue')
      .groupBy('t.commodityType')
      .getRawMany<{ commodityType: string; collections: string; sales: string; totalQuantity: string; totalValue: string }>();

    return rows.map((r) => ({
      commodityType: r.commodityType,
      collections: parseInt(r.collections, 10),
      sales: parseInt(r.sales, 10),
      totalQuantity: parseFloat(r.totalQuantity ?? '0'),
      totalValue: parseFloat(r.totalValue ?? '0'),
    }));
  }

  toDto(t: CommodityTransaction) {
    return {
      id: t.id, commodityType: t.commodityType, action: t.action,
      transactionDate: t.transactionDate, memberId: t.memberId, cigId: t.cigId,
      quantity: Number(t.quantity), unit: t.unit, qualityGrade: t.qualityGrade,
      unitPrice: Number(t.unitPrice), totalAmount: Number(t.totalAmount),
      buyerName: t.buyerName, paymentMethod: t.paymentMethod,
      notes: t.notes, createdAt: t.createdAt.toISOString(),
    };
  }
}
