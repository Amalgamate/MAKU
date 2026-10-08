import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@maku/shared-types';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^(\+?254|0)7\d{8}$/, { message: 'phone must be a valid Kenyan mobile number' })
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class UpdateUserRoleDto {
  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class ChangePasswordDto {
  @ApiPropertyOptional()
  @IsString()
  currentPassword!: string;

  @ApiPropertyOptional({ minLength: 8 })
  @IsString()
  newPassword!: string;
}
