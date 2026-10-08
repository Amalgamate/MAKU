import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { LivestockTransaction, LivestockTransactionStatus } from './livestock-transaction.entity';
import type { CreateLivestockTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class LivestockService {
  constructor(
    @InjectRepository(LivestockTransaction)
    private readonly repo: Repository<LivestockTransaction>,
  ) {}

  async create(dto: CreateLivestockTransactionDto, userId: string): Promise<LivestockTransaction> {
    const totalAmount = dto.pricePerUnit * dto.quantity;
    const commission  = dto.makuCommission ?? 0;
    const proceeds    = totalAmount - commission;

    const tx = this.repo.create({
      ...dto,
      totalAmount,
      makuCommission: commission,
      memberProceeds: proceeds,
      paymentMethod: dto.paymentMethod ?? 'cash',
      recordedBy: userId,
      status: LivestockTransactionStatus.COMPLETED,
    });
    return this.repo.save(tx);
  }

  async findAll(filters: {
    memberId?: string;
    cigId?: string;
    species?: string;
    from?: string;
    to?: string;
    page?: number;
    perPage?: number;
  }): Promise<{ data: LivestockTransaction[]; total: number }> {
    const { memberId, cigId, species, from, to, page = 1, perPage = 25 } = filters;

    const qb = this.repo.createQueryBuilder('t').orderBy('t.marketDate', 'DESC');

    if (memberId) qb.andWhere('t.sellerMemberId = :memberId', { memberId });
    if (cigId)    qb.andWhere('t.cigId = :cigId', { cigId });
    if (species)  qb.andWhere('t.species = :species', { species });
    if (from)     qb.andWhere('t.marketDate >= :from', { from });
    if (to)       qb.andWhere('t.marketDate <= :to', { to });

    const [data, total] = await qb
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: string): Promise<LivestockTransaction> {
    const tx = await this.repo.findOne({ where: { id } });
    if (!tx) throw new NotFoundException('Transaction not found');
    return tx;
  }

  async getSummary(from?: string, to?: string): Promise<{
    totalTransactions: number;
    totalAnimals: number;
    totalValue: number;
    totalCommission: number;
    totalProceeds: number;
    bySpecies: Record<string, { count: number; animals: number; value: number }>;
  }> {
    const qb = this.repo.createQueryBuilder('t')
      .where('t.status = :s', { s: LivestockTransactionStatus.COMPLETED });
    if (from) qb.andWhere('t.marketDate >= :from', { from });
    if (to)   qb.andWhere('t.marketDate <= :to', { to });

    const rows = await qb.getMany();

    const bySpecies: Record<string, { count: number; animals: number; value: number }> = {};
    let totalAnimals = 0, totalValue = 0, totalCommission = 0, totalProceeds = 0;

    for (const r of rows) {
      totalAnimals   += r.quantity;
      totalValue     += Number(r.totalAmount);
      totalCommission+= Number(r.makuCommission);
      totalProceeds  += Number(r.memberProceeds);

      if (!bySpecies[r.species]) bySpecies[r.species] = { count: 0, animals: 0, value: 0 };
      bySpecies[r.species]!.count++;
      bySpecies[r.species]!.animals += r.quantity;
      bySpecies[r.species]!.value   += Number(r.totalAmount);
    }

    return {
      totalTransactions: rows.length,
      totalAnimals,
      totalValue,
      totalCommission,
      totalProceeds,
      bySpecies,
    };
  }

  toDto(t: LivestockTransaction) {
    return {
      id: t.id,
      marketDate: t.marketDate,
      marketLocation: t.marketLocation,
      sellerMemberId: t.sellerMemberId,
      buyerName: t.buyerName,
      buyerPhone: t.buyerPhone,
      species: t.species,
      quantity: t.quantity,
      totalWeightKg: t.totalWeightKg ? Number(t.totalWeightKg) : null,
      pricePerUnit: Number(t.pricePerUnit),
      totalAmount: Number(t.totalAmount),
      makuCommission: Number(t.makuCommission),
      memberProceeds: Number(t.memberProceeds),
      paymentMethod: t.paymentMethod,
      mpesaReference: t.mpesaReference,
      paymentConfirmed: t.paymentConfirmed,
      status: t.status,
      cigId: t.cigId,
      recordedBy: t.recordedBy,
      notes: t.notes,
      createdAt: t.createdAt.toISOString(),
    };
  }
}
