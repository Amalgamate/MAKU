import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Grant, GrantStatus } from './grant.entity';
import type { CreateGrantDto } from './dto/create-grant.dto';

@Injectable()
export class GrantsService {
  constructor(@InjectRepository(Grant) private readonly repo: Repository<Grant>) {}

  async create(dto: CreateGrantDto): Promise<Grant> { return this.repo.save(this.repo.create(dto)); }

  async findAll(status?: string): Promise<Grant[]> {
    const qb = this.repo.createQueryBuilder('g').orderBy('g.createdAt', 'DESC');
    if (status) qb.andWhere('g.status = :status', { status });
    return qb.getMany();
  }

  async findById(id: string): Promise<Grant> {
    const g = await this.repo.findOne({ where: { id } });
    if (!g) throw new NotFoundException('Grant not found');
    return g;
  }

  async update(id: string, dto: Partial<CreateGrantDto> & { amountAwarded?: number; amountDisbursed?: number; awardDate?: string; endDate?: string }): Promise<Grant> {
    const g = await this.findById(id);
    Object.assign(g, dto);
    return this.repo.save(g);
  }

  async getPipelineSummary() {
    const rows = await this.repo.createQueryBuilder('g')
      .select('g.status', 'status').addSelect('COUNT(*)', 'count')
      .addSelect('SUM(g.amount_requested)', 'requested').addSelect('SUM(g.amount_awarded)', 'awarded')
      .groupBy('g.status').getRawMany<{ status: string; count: string; requested: string; awarded: string }>();
    const totalPipeline = rows.filter((r) => [GrantStatus.AWARDED, GrantStatus.ACTIVE].includes(r.status as GrantStatus))
      .reduce((s, r) => s + parseFloat(r.awarded ?? '0'), 0);
    return { byStatus: rows.map((r) => ({ status: r.status, count: parseInt(r.count, 10), requested: parseFloat(r.requested ?? '0'), awarded: parseFloat(r.awarded ?? '0') })), totalPipeline };
  }

  toDto(g: Grant) {
    return {
      id: g.id, title: g.title, donorName: g.donorName, ngoId: g.ngoId,
      status: g.status, amountRequested: Number(g.amountRequested),
      amountAwarded: Number(g.amountAwarded), amountDisbursed: Number(g.amountDisbursed),
      deadline: g.deadline, awardDate: g.awardDate, endDate: g.endDate,
      focusArea: g.focusArea, reportingSchedule: g.reportingSchedule,
      nextReportDue: g.nextReportDue, description: g.description,
      notes: g.notes, createdAt: g.createdAt.toISOString(),
    };
  }
}
