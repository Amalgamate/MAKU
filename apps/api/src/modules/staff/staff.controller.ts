import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '@maku/shared-types';

@ApiTags('Staff') @ApiBearerAuth() @Controller('staff')
export class StaffController {
  constructor(private readonly svc: StaffService) {}

  @Post() @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Add a staff member' })
  async create(@Body() dto: CreateStaffDto) { return this.svc.toDto(await this.svc.create(dto)); }

  @Get() @ApiOperation({ summary: 'List all active staff' })
  async findAll(@Query('search') search?: string) {
    return (await this.svc.findAll(search)).map((s) => this.svc.toDto(s));
  }

  @Get(':id') @ApiOperation({ summary: 'Get staff member by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.toDto(await this.svc.findById(id)); }

  @Patch(':id') @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update staff details' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateStaffDto>) {
    return this.svc.toDto(await this.svc.update(id, dto));
  }

  @Patch(':id/terminate') @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Terminate a staff member' })
  async terminate(@Param('id', ParseUUIDPipe) id: string, @Body() body: { endDate: string }) {
    return this.svc.toDto(await this.svc.terminate(id, body.endDate));
  }
}
