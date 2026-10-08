import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Member } from '../members/member.entity';
import { MemberStatus } from '@maku/shared-types';
import { Cig } from '../cigs/cig.entity';
import { LivestockTransaction, LivestockTransactionStatus } from '../livestock/livestock-transaction.entity';
import { WaterVoucher } from '../water-vouchers/water-voucher.entity';
import { FinanceTransaction, TransactionType } from '../finance/finance-transaction.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(Cig)
    private readonly cigRepo: Repository<Cig>,
    @InjectRepository(LivestockTransaction)
    private readonly livestockRepo: Repository<LivestockTransaction>,
    @InjectRepository(WaterVoucher)
    private readonly voucherRepo: Repository<WaterVoucher>,
    @InjectRepository(FinanceTransaction)
    private readonly financeRepo: Repository<FinanceTransaction>,
  ) {}

  async getKpis() {
    // ── Members ────────────────────────────────────────────────────────────
    const totalMembers  = await this.memberRepo.count();
    const activeMembers = await this.memberRepo.count({ where: { status: MemberStatus.ACTIVE } });
    const pendingMembers= await this.memberRepo.count({ where: { status: MemberStatus.PENDING } });
    const totalCigs     = await this.cigRepo.count();

    // ── Livestock (this month) ─────────────────────────────────────────────
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const livestockThisMonth = await this.livestockRepo
      .createQueryBuilder('t')
      .select('SUM(t.quantity)', 'animals')
      .addSelect('SUM(t.total_amount)', 'value')
      .addSelect('COUNT(*)', 'transactions')
      .where('t.status = :s', { s: LivestockTransactionStatus.COMPLETED })
      .andWhere('t.market_date >= :start', { start: monthStart })
      .getRawOne<{ animals: string; value: string; transactions: string }>();

    // ── Livestock (all time) ──────────────────────────────────────────────
    const livestockAllTime = await this.livestockRepo
      .createQueryBuilder('t')
      .select('SUM(t.quantity)', 'animals')
      .addSelect('SUM(t.total_amount)', 'value')
      .where('t.status = :s', { s: LivestockTransactionStatus.COMPLETED })
      .getRawOne<{ animals: string; value: string }>();

    // ── Water vouchers (this month) ─────────────────────────────────────────
    const vouchersThisMonth = await this.voucherRepo
      .createQueryBuilder('v')
      .select('COUNT(*)', 'issued')
      .addSelect('SUM(v.litres_allocated)', 'litres')
      .where('v.issue_date >= :start', { start: monthStart })
      .getRawOne<{ issued: string; litres: string }>();

    // ── Member growth (last 6 months) ───────────────────────────────────────
    const memberGrowth = await this.memberRepo
      .createQueryBuilder('m')
      .select("TO_CHAR(DATE_TRUNC('month', m.created_at), 'Mon YYYY')", 'month')
      .addSelect('COUNT(*)', 'count')
      .where("m.created_at >= NOW() - INTERVAL '6 months'")
      .groupBy("DATE_TRUNC('month', m.created_at)")
      .orderBy("DATE_TRUNC('month', m.created_at)", 'ASC')
      .getRawMany<{ month: string; count: string }>();

    // ── Livestock by species (all time) ────────────────────────────────────
    const bySpecies = await this.livestockRepo
      .createQueryBuilder('t')
      .select('t.species', 'species')
      .addSelect('SUM(t.quantity)', 'animals')
      .addSelect('SUM(t.total_amount)', 'value')
      .where('t.status = :s', { s: LivestockTransactionStatus.COMPLETED })
      .groupBy('t.species')
      .orderBy('SUM(t.total_amount)', 'DESC')
      .getRawMany<{ species: string; animals: string; value: string }>();

    // ── Finance (this month) ────────────────────────────────────────────────
    const financeThisMonth = await this.financeRepo
      .createQueryBuilder('f')
      .select(`SUM(CASE WHEN f.type = 'income' THEN f.amount ELSE 0 END)`, 'income')
      .addSelect(`SUM(CASE WHEN f.type = 'expense' THEN f.amount ELSE 0 END)`, 'expense')
      .where('f.transaction_date >= :start', { start: monthStart })
      .getRawOne<{ income: string; expense: string }>();

    return {
      members: {
        total:   totalMembers,
        active:  activeMembers,
        pending: pendingMembers,
        cigs:    totalCigs,
      },
      livestock: {
        thisMonth: {
          transactions: parseInt(livestockThisMonth?.transactions ?? '0', 10),
          animals:      parseInt(livestockThisMonth?.animals ?? '0', 10),
          value:        parseFloat(livestockThisMonth?.value ?? '0'),
        },
        allTime: {
          animals: parseInt(livestockAllTime?.animals ?? '0', 10),
          value:   parseFloat(livestockAllTime?.value ?? '0'),
        },
        bySpecies: bySpecies.map((r) => ({
          species: r.species,
          animals: parseInt(r.animals, 10),
          value:   parseFloat(r.value),
        })),
      },
      waterVouchers: {
        thisMonth: {
          issued: parseInt(vouchersThisMonth?.issued ?? '0', 10),
          litres: parseFloat(vouchersThisMonth?.litres ?? '0'),
        },
      },
      finance: {
        thisMonth: {
          income:  parseFloat(financeThisMonth?.income  ?? '0'),
          expense: parseFloat(financeThisMonth?.expense ?? '0'),
          net:     parseFloat(financeThisMonth?.income  ?? '0') - parseFloat(financeThisMonth?.expense ?? '0'),
        },
      },
      memberGrowth: memberGrowth.map((r) => ({
        month: r.month,
        count: parseInt(r.count, 10),
      })),
    };
  }

  async getRecentActivity() {
    const livestock = await this.livestockRepo.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });
    const vouchers = await this.voucherRepo.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });
    const members = await this.memberRepo.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      recentLivestock: livestock,
      recentVouchers:  vouchers,
      recentMembers:   members.map((m) => ({
        id: m.id,
        fullName: m.fullName,
        memberNumber: m.memberNumber,
        status: m.status,
        registrationDate: m.registrationDate,
      })),
    };
  }
}
