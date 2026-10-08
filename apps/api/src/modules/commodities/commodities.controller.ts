import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommoditiesService } from './commodities.service';
import { CreateCommodityDto } from './dto/create-commodity.dto';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { UserRole } from '@maku/shared-types';

@ApiTags('Commodities') @ApiBearerAuth() @Controller('commodities')
export class CommoditiesController {
  constructor(private readonly svc: CommoditiesService) {}

  @Post() @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Record a commodity transaction (collection or sale)' })
  async create(@Body() dto: CreateCommodityDto, @CurrentUser() caller: JwtPayload) {
    return this.svc.toDto(await this.svc.create(dto, caller.sub));
  }

  @Get() @ApiOperation({ summary: 'List commodity transactions' })
  async findAll(
    @Query('commodityType') commodityType?: string, @Query('action') action?: string,
    @Query('memberId') memberId?: string, @Query('from') from?: string,
    @Query('to') to?: string, @Query('page') page = '1', @Query('perPage') perPage = '25',
  ) {
    const { data, total } = await this.svc.findAll({ commodityType, action, memberId, from, to, page: parseInt(page, 10), perPage: parseInt(perPage, 10) });
    const p = parseInt(page, 10), pp = parseInt(perPage, 10);
    return { data: data.map((t) => this.svc.toDto(t)), meta: { page: p, perPage: pp, total, totalPages: Math.ceil(total / pp) } };
  }

  @Get('summary') @ApiOperation({ summary: 'Commodity summary by type' })
  async summary() { return this.svc.getSummary(); }
}
