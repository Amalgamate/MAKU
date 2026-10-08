import {
  Body, Controller, Get, Param, ParseUUIDPipe,
  Post, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LivestockService } from './livestock.service';
import { CreateLivestockTransactionDto } from './dto/create-transaction.dto';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { UserRole } from '@maku/shared-types';

@ApiTags('Livestock')
@ApiBearerAuth()
@Controller('livestock')
export class LivestockController {
  constructor(private readonly svc: LivestockService) {}

  // POST /v1/livestock
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Record a livestock sale transaction' })
  async create(
    @Body() dto: CreateLivestockTransactionDto,
    @CurrentUser() caller: JwtPayload,
  ) {
    const tx = await this.svc.create(dto, caller.sub);
    return this.svc.toDto(tx);
  }

  // GET /v1/livestock
  @Get()
  @ApiOperation({ summary: 'List livestock transactions with filters' })
  async findAll(
    @Query('memberId') memberId?: string,
    @Query('cigId') cigId?: string,
    @Query('species') species?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page = '1',
    @Query('perPage') perPage = '25',
  ) {
    const { data, total } = await this.svc.findAll({
      memberId, cigId, species, from, to,
      page: parseInt(page, 10),
      perPage: parseInt(perPage, 10),
    });
    const p = parseInt(page, 10);
    const pp = parseInt(perPage, 10);
    return {
      data: data.map((t) => this.svc.toDto(t)),
      meta: { page: p, perPage: pp, total, totalPages: Math.ceil(total / pp) },
    };
  }

  // GET /v1/livestock/summary
  @Get('summary')
  @ApiOperation({ summary: 'Get livestock sales summary (KPIs)' })
  async summary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.svc.getSummary(from, to);
  }

  // GET /v1/livestock/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get a single transaction' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const tx = await this.svc.findById(id);
    return this.svc.toDto(tx);
  }
}
