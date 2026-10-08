import { IsEmail, IsEnum, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@maku/shared-types';

export class CreateUserDto {
  @ApiProperty({ example: 'Jane Mwangi' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: 'jane@maku.coop' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+254712345678' })
  @IsString()
  @Matches(/^(\+?254|0)7\d{8}$/, { message: 'phone must be a valid Kenyan mobile number' })
  phone!: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
