import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '@maku/shared-types';

@ApiTags('Suppliers') @ApiBearerAuth() @Controller('suppliers')
export class SuppliersController {
  constructor(private readonly svc: SuppliersService) {}

  @Post() @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  @ApiOperation({ summary: 'Register a new supplier' })
  async create(@Body() dto: CreateSupplierDto) {
    return this.svc.toDto(await this.svc.create(dto));
  }

  @Get() @ApiOperation({ summary: 'List suppliers' })
  async findAll(@Query('search') search?: string, @Query('category') category?: string) {
    return (await this.svc.findAll(search, category)).map((s) => this.svc.toDto(s));
  }

  @Get(':id') @ApiOperation({ summary: 'Get supplier by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.toDto(await this.svc.findById(id));
  }

  @Patch(':id') @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  @ApiOperation({ summary: 'Update supplier' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateSupplierDto>) {
    return this.svc.toDto(await this.svc.update(id, dto));
  }

  @Delete(':id') @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate supplier' })
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.toDto(await this.svc.deactivate(id));
  }
}
