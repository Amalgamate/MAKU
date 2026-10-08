import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NgosService } from './ngos.service';
import { CreateNgoDto } from './dto/create-ngo.dto';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '@maku/shared-types';

@ApiTags('NGOs') @ApiBearerAuth() @Controller('ngos')
export class NgosController {
  constructor(private readonly svc: NgosService) {}
  @Post() @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async create(@Body() dto: CreateNgoDto) { return this.svc.toDto(await this.svc.create(dto)); }
  @Get() async findAll(@Query('search') s?: string) { return (await this.svc.findAll(s)).map((n) => this.svc.toDto(n)); }
  @Get(':id') async findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.toDto(await this.svc.findById(id)); }
  @Patch(':id') @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateNgoDto>) { return this.svc.toDto(await this.svc.update(id, dto)); }
}
