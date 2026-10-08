import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GrantsService } from './grants.service';
import { CreateGrantDto } from './dto/create-grant.dto';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '@maku/shared-types';

@ApiTags('Grants') @ApiBearerAuth() @Controller('grants')
export class GrantsController {
  constructor(private readonly svc: GrantsService) {}
  @Post() @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN) async create(@Body() dto: CreateGrantDto) { return this.svc.toDto(await this.svc.create(dto)); }
  @Get() async findAll(@Query('status') status?: string) { return (await this.svc.findAll(status)).map((g) => this.svc.toDto(g)); }
  @Get('pipeline') async pipeline() { return this.svc.getPipelineSummary(); }
  @Get(':id') async findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.toDto(await this.svc.findById(id)); }
  @Patch(':id') @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Parameters<typeof this.svc.update>[1]) { return this.svc.toDto(await this.svc.update(id, dto)); }
}
