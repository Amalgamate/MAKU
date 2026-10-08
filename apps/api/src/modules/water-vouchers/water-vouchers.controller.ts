import {
  Body, Controller, Get, Param, ParseUUIDPipe,
  Patch, Post, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { WaterVouchersService } from './water-vouchers.service';
import { CreateWaterVoucherDto } from './dto/create-voucher.dto';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { UserRole } from '@maku/shared-types';

class MarkUsedDto {
  @Type(() => Number) @IsNumber() @Min(0)
  litresUsed!: number;
}

@ApiTags('Water Vouchers')
@ApiBearerAuth()
@Controller('water-vouchers')
export class WaterVouchersController {
  constructor(private readonly svc: WaterVouchersService) {}

  // POST /v1/water-vouchers
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Issue a water voucher to a member' })
  async create(
    @Body() dto: CreateWaterVoucherDto,
    @CurrentUser() caller: JwtPayload,
  ) {
    const v = await this.svc.create(dto, caller.sub);
    return this.svc.toDto(v);
  }

  // GET /v1/water-vouchers
  @Get()
  @ApiOperation({ summary: 'List water vouchers with filters' })
  async findAll(
    @Query('memberId') memberId?: string,
    @Query('cigId') cigId?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page = '1',
    @Query('perPage') perPage = '25',
  ) {
    const { data, total } = await this.svc.findAll({
      memberId, cigId, status, from, to,
      page: parseInt(page, 10),
      perPage: parseInt(perPage, 10),
    });
    const p = parseInt(page, 10);
    const pp = parseInt(perPage, 10);
    return {
      data: data.map((v) => this.svc.toDto(v)),
      meta: { page: p, perPage: pp, total, totalPages: Math.ceil(total / pp) },
    };
  }

  // GET /v1/water-vouchers/summary
  @Get('summary')
  @ApiOperation({ summary: 'Get water voucher summary (KPIs)' })
  async summary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.svc.getSummary(from, to);
  }

  // GET /v1/water-vouchers/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get a single voucher' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const v = await this.svc.findById(id);
    return this.svc.toDto(v);
  }

  // PATCH /v1/water-vouchers/:id/use
  @Patch(':id/use')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Mark a voucher as used' })
  async markUsed(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MarkUsedDto,
  ) {
    const v = await this.svc.markUsed(id, dto.litresUsed);
    return this.svc.toDto(v);
  }
}
