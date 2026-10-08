import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserRoleDto, ChangePasswordDto } from './dto/update-user.dto';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { UserRole } from '@maku/shared-types';
import * as bcrypt from 'bcrypt';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /v1/users — admin creates a new user
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user account (admin only)' })
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return this.usersService.toProfile(user);
  }

  // GET /v1/users
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'List all users (paginated)' })
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 25) {
    const { data, total } = await this.usersService.findAll(+page, +perPage);
    return {
      data: data.map((u) => this.usersService.toProfile(u)),
      meta: {
        page: +page,
        perPage: +perPage,
        total,
        totalPages: Math.ceil(total / +perPage),
      },
    };
  }

  // GET /v1/users/:id
  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a user by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    return this.usersService.toProfile(user);
  }

  // PATCH /v1/users/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile (admin or own profile)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() caller: JwtPayload,
  ) {
    // Allow users to update their own profile; admins can update anyone
    const isAdmin = [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(caller.role);
    if (!isAdmin && caller.sub !== id) {
      throw new UnauthorizedException('You can only update your own profile');
    }
    const user = await this.usersService.update(id, dto);
    return this.usersService.toProfile(user);
  }

  // PATCH /v1/users/:id/role-status — admin only
  @Patch(':id/role-status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user role and/or status (admin only)' })
  async updateRoleStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    const user = await this.usersService.updateRoleStatus(id, dto);
    return this.usersService.toProfile(user);
  }

  // PATCH /v1/users/:id/password
  @Patch(':id/password')
  @ApiOperation({ summary: 'Change own password' })
  async changePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangePasswordDto,
    @CurrentUser() caller: JwtPayload,
  ) {
    if (caller.sub !== id) throw new UnauthorizedException('You can only change your own password');
    const user = await this.usersService.findById(id);
    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');
    await this.usersService.updatePassword(id, dto.newPassword);
    return { message: 'Password changed successfully' };
  }

  // DELETE /v1/users/:id — soft deactivate
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate a user account (soft delete)' })
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.deactivate(id);
    return this.usersService.toProfile(user);
  }
}
