import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { UserRole } from '@maku/shared-types';

class PaymentDto {
  @Type(() => Number) @IsNumber() @Min(0.01) amount!: number;
}

@ApiTags('Purchases & Sales') @ApiBearerAuth() @Controller('purchases')
export class PurchasesController {
  constructor(private readonly svc: PurchasesService) {}

  @Post() @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  @ApiOperation({ summary: 'Record a purchase or sale transaction' })
  async create(@Body() dto: CreatePurchaseDto, @CurrentUser() caller: JwtPayload) {
    return this.svc.toDto(await this.svc.create(dto, caller.sub));
  }

  @Get() @ApiOperation({ summary: 'List purchases/sales with filters' })
  async findAll(
    @Query('type') type?: string, @Query('supplierId') supplierId?: string,
    @Query('memberId') memberId?: string, @Query('from') from?: string,
    @Query('to') to?: string, @Query('page') page = '1', @Query('perPage') perPage = '25',
  ) {
    const { data, total } = await this.svc.findAll({
      type, supplierId, memberId, from, to,
      page: parseInt(page, 10), perPage: parseInt(perPage, 10),
    });
    const p = parseInt(page, 10), pp = parseInt(perPage, 10);
    return { data: data.map((t) => this.svc.toDto(t)), meta: { page: p, perPage: pp, total, totalPages: Math.ceil(total / pp) } };
  }

  @Get('summary') @ApiOperation({ summary: 'Purchases & sales summary' })
  async summary() { return this.svc.getSummary(); }

  @Get(':id') @ApiOperation({ summary: 'Get a single transaction' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.toDto(await this.svc.findById(id));
  }

  @Post(':id/payment') @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  @ApiOperation({ summary: 'Record a payment against a transaction' })
  async payment(@Param('id', ParseUUIDPipe) id: string, @Body() dto: PaymentDto) {
    return this.svc.toDto(await this.svc.recordPayment(id, dto.amount));
  }
}
