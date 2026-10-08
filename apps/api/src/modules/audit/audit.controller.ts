import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole, AuditAction } from '@maku/shared-types';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly svc: AuditService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get audit log entries (admin only)' })
  async findAll(
    @Query('userId') userId?: string,
    @Query('entityType') entityType?: string,
    @Query('action') action?: string,
    @Query('page') page = '1',
    @Query('perPage') perPage = '50',
  ) {
    const { data, total } = await this.svc.findAll(
      parseInt(page, 10),
      parseInt(perPage, 10),
      {
        userId,
        entityType,
        action: action as AuditAction | undefined,
      },
    );
    const p = parseInt(page, 10), pp = parseInt(perPage, 10);
    return {
      data,
      meta: { page: p, perPage: pp, total, totalPages: Math.ceil(total / pp) },
    };
  }
}
