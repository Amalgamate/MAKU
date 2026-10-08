import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ProcurementService } from './procurement.service';
import { CreateProcurementDto } from './dto/create-procurement.dto';
import { ProcurementStatus } from './procurement-order.entity';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { UserRole } from '@maku/shared-types';

class UpdateStatusDto {
  @IsEnum(ProcurementStatus) status!: ProcurementStatus;
}

class AddQuoteDto {
  @IsString() supplier!: string;
  @Type(() => Number) @IsNumber() @Min(0) amount!: number;
  @IsOptional() @IsString() notes?: string;
}

@ApiTags('Procurement') @ApiBearerAuth() @Controller('procurement')
export class ProcurementController {
  constructor(private readonly svc: ProcurementService) {}

  @Post() @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  @ApiOperation({ summary: 'Raise a procurement requisition' })
  async create(@Body() dto: CreateProcurementDto, @CurrentUser() caller: JwtPayload) {
    return this.svc.toDto(await this.svc.create(dto, caller.sub));
  }

  @Get() @ApiOperation({ summary: 'List procurement orders' })
  async findAll(
    @Query('status') status?: string, @Query('supplierId') supplierId?: string,
    @Query('page') page = '1', @Query('perPage') perPage = '25',
  ) {
    const { data, total } = await this.svc.findAll({ status, supplierId, page: parseInt(page, 10), perPage: parseInt(perPage, 10) });
    const p = parseInt(page, 10), pp = parseInt(perPage, 10);
    return { data: data.map((o) => this.svc.toDto(o)), meta: { page: p, perPage: pp, total, totalPages: Math.ceil(total / pp) } };
  }

  @Get('summary') @ApiOperation({ summary: 'Procurement summary by status' })
  async summary() { return this.svc.getSummary(); }

  @Get(':id') @ApiOperation({ summary: 'Get a single procurement order' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.toDto(await this.svc.findById(id));
  }

  @Patch(':id/status') @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Advance procurement order status' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() caller: JwtPayload,
  ) {
    return this.svc.toDto(await this.svc.updateStatus(id, dto.status, caller.sub));
  }

  @Post(':id/quotes') @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  @ApiOperation({ summary: 'Add a supplier quote to a procurement order' })
  async addQuote(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AddQuoteDto) {
    return this.svc.toDto(await this.svc.addQuote(id, dto));
  }
}
