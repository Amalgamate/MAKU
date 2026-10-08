import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { FinanceTransaction, TransactionType } from './finance-transaction.entity';
import { PettyCashEntry, PettyCashAction } from './petty-cash.entity';
import type { CreateFinanceTransactionDto } from './dto/create-transaction.dto';
import type { CreatePettyCashDto } from './dto/create-petty-cash.dto';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(FinanceTransaction)
    private readonly txRepo: Repository<FinanceTransaction>,
    @InjectRepository(PettyCashEntry)
    private readonly pcRepo: Repository<PettyCashEntry>,
  ) {}

  // ─── General Ledger ───────────────────────────────────────────────────────

  async createTransaction(
    dto: CreateFinanceTransactionDto,
    userId: string,
  ): Promise<FinanceTransaction> {
    const tx = this.txRepo.create({ ...dto, recordedBy: userId });
    return this.txRepo.save(tx);
  }

  async findTransactions(filters: {
    type?: string;
    category?: string;
    from?: string;
    to?: string;
    memberId?: string;
    page?: number;
    perPage?: number;
  }): Promise<{ data: FinanceTransaction[]; total: number }> {
    const { type, category, from, to, memberId, page = 1, perPage = 25 } = filters;
    const qb = this.txRepo.createQueryBuilder('t').orderBy('t.transactionDate', 'DESC');

    if (type)     qb.andWhere('t.type = :type', { type });
    if (category) qb.andWhere('t.category = :category', { category });
    if (from)     qb.andWhere('t.transactionDate >= :from', { from });
    if (to)       qb.andWhere('t.transactionDate <= :to', { to });
    if (memberId) qb.andWhere('t.memberId = :memberId', { memberId });

    const [data, total] = await qb.skip((page - 1) * perPage).take(perPage).getManyAndCount();
    return { data, total };
  }

  async findTransactionById(id: string): Promise<FinanceTransaction> {
    const tx = await this.txRepo.findOne({ where: { id } });
    if (!tx) throw new NotFoundException('Transaction not found');
    return tx;
  }

  async getLedgerSummary(from?: string, to?: string) {
    const qb = this.txRepo.createQueryBuilder('t');
    if (from) qb.andWhere('t.transactionDate >= :from', { from });
    if (to)   qb.andWhere('t.transactionDate <= :to', { to });
    const rows = await qb.getMany();

    const totalIncome  = rows.filter((r) => r.type === TransactionType.INCOME)
      .reduce((s, r) => s + Number(r.amount), 0);
    const totalExpense = rows.filter((r) => r.type === TransactionType.EXPENSE)
      .reduce((s, r) => s + Number(r.amount), 0);
    const netBalance   = totalIncome - totalExpense;

    // Group by category
    const byCategory: Record<string, { income: number; expense: number }> = {};
    for (const r of rows) {
      if (!byCategory[r.category]) byCategory[r.category] = { income: 0, expense: 0 };
      if (r.type === TransactionType.INCOME) byCategory[r.category].income  += Number(r.amount);
      else                                   byCategory[r.category].expense += Number(r.amount);
    }

    // Monthly trend (last 6 months)
    const monthlyTrend = await this.txRepo
      .createQueryBuilder('t')
      .select("TO_CHAR(DATE_TRUNC('month', t.transaction_date), 'Mon YYYY')", 'month')
      .addSelect(`SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END)`, 'income')
      .addSelect(`SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END)`, 'expense')
      .where("t.transaction_date >= NOW() - INTERVAL '6 months'")
      .groupBy("DATE_TRUNC('month', t.transaction_date)")
      .orderBy("DATE_TRUNC('month', t.transaction_date)", 'ASC')
      .getRawMany<{ month: string; income: string; expense: string }>();

    return {
      totalIncome,
      totalExpense,
      netBalance,
      transactionCount: rows.length,
      byCategory,
      monthlyTrend: monthlyTrend.map((r) => ({
        month: r.month,
        income:  parseFloat(r.income ?? '0'),
        expense: parseFloat(r.expense ?? '0'),
      })),
    };
  }

  // ─── Petty Cash ───────────────────────────────────────────────────────────

  async createPettyCashEntry(dto: CreatePettyCashDto, userId: string): Promise<PettyCashEntry> {
    // Calculate running balance
    const last = await this.pcRepo.findOne({ order: { createdAt: 'DESC' }, where: {} });
    const currentBalance = last ? Number(last.balanceAfter) : 0;

    let balanceAfter: number;
    if (dto.action === PettyCashAction.TOP_UP) {
      balanceAfter = currentBalance + Number(dto.amount);
    } else if (dto.action === PettyCashAction.EXPENSE) {
      balanceAfter = currentBalance - Number(dto.amount);
    } else {
      // RECONCILE — set balance to the given amount
      balanceAfter = Number(dto.amount);
    }

    const entry = this.pcRepo.create({ ...dto, balanceAfter, recordedBy: userId });
    return this.pcRepo.save(entry);
  }

  async getPettyCashEntries(page = 1, perPage = 25): Promise<{ data: PettyCashEntry[]; total: number }> {
    const [data, total] = await this.pcRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });
    return { data, total };
  }

  async getPettyCashBalance(): Promise<number> {
    const last = await this.pcRepo.findOne({ order: { createdAt: 'DESC' }, where: {} });
    return last ? Number(last.balanceAfter) : 0;
  }

  // ─── Serialisers ─────────────────────────────────────────────────────────

  txToDto(t: FinanceTransaction) {
    return {
      id: t.id,
      transactionDate: t.transactionDate,
      type: t.type,
      category: t.category,
      description: t.description,
      amount: Number(t.amount),
      paymentMethod: t.paymentMethod,
      referenceNumber: t.referenceNumber,
      memberId: t.memberId,
      livestockTransactionId: t.livestockTransactionId,
      voucherId: t.voucherId,
      recordedBy: t.recordedBy,
      approvedBy: t.approvedBy,
      notes: t.notes,
      createdAt: t.createdAt.toISOString(),
    };
  }

  pcToDto(e: PettyCashEntry) {
    return {
      id: e.id,
      entryDate: e.entryDate,
      action: e.action,
      description: e.description,
      amount: Number(e.amount),
      balanceAfter: Number(e.balanceAfter),
      receiptRef: e.receiptRef,
      recordedBy: e.recordedBy,
      createdAt: e.createdAt.toISOString(),
    };
  }
}
