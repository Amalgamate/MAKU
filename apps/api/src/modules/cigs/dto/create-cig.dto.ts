import { IsEnum, IsISO8601, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CigType } from '@maku/shared-types';

export class CreateCigDto {
  @ApiProperty({ example: 'Merti Honey Producers CIG' })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiPropertyOptional({ enum: CigType, default: CigType.GEOGRAPHY })
  @IsOptional()
  @IsEnum(CigType)
  type?: CigType;

  @ApiPropertyOptional({ example: '2024-03-15' })
  @IsOptional()
  @IsISO8601()
  registrationDate?: string;

  @ApiPropertyOptional({ example: 'Merti' })
  @IsOptional()
  @IsString()
  subLocation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  chairpersonMemberId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  secretaryMemberId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  treasurerMemberId?: string;
}
