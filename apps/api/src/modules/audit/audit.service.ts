import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { AuditAction } from '@maku/shared-types';

interface LogParams {
  entityType: string;
  entityId: string;
  action: AuditAction;
  previousValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  userId?: string | null;
  userFullName?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async log(params: LogParams): Promise<void> {
    const entry = this.repo.create({
      ...params,
      previousValue: params.previousValue ?? null,
      newValue: params.newValue ?? null,
    });
    // Fire-and-forget — audit logging should never block the main response
    await this.repo.save(entry).catch(() => {
      // Silent — audit failure must not crash the app
    });
  }

  async findAll(
    page = 1,
    perPage = 50,
    filters: { userId?: string; entityType?: string; action?: AuditAction } = {},
  ) {
    const qb = this.repo.createQueryBuilder('log').orderBy('log.created_at', 'DESC');

    if (filters.userId) qb.andWhere('log.user_id = :userId', { userId: filters.userId });
    if (filters.entityType) qb.andWhere('log.entity_type = :type', { type: filters.entityType });
    if (filters.action) qb.andWhere('log.action = :action', { action: filters.action });

    const [data, total] = await qb
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    return { data, total };
  }
}
