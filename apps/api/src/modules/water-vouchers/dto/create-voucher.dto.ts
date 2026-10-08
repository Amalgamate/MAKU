import {
  IsISO8601, IsNumber, IsOptional, IsString, IsUUID, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateWaterVoucherDto {
  @ApiProperty()
  @IsUUID()
  memberId!: string;

  @ApiProperty({ example: 1000 })
  @Type(() => Number) @IsNumber() @Min(1)
  litresAllocated!: number;

  @ApiPropertyOptional({ example: 'Merti Borehole 1' })
  @IsOptional() @IsString()
  boreholeName?: string;

  @ApiPropertyOptional({ example: 0.5 })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  costPerLitre?: number;

  @ApiProperty({ example: '2026-10-06' })
  @IsISO8601()
  issueDate!: string;

  @ApiPropertyOptional({ example: '2026-10-13' })
  @IsOptional() @IsISO8601()
  expiryDate?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUUID()
  cigId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  notes?: string;
}
