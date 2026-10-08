import {
  IsArray, IsBoolean, IsISO8601, IsNumber,
  IsOptional, IsString, IsUUID, Min, MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProcurementDto {
  @ApiProperty() @IsString() @MinLength(3) title!: string;
  @ApiProperty() @IsString() @MinLength(5) description!: string;
  @ApiProperty({ example: '2026-10-06' }) @IsISO8601() requisitionDate!: string;
  @ApiProperty({ example: 50000 }) @Type(() => Number) @IsNumber() @Min(0) budgetAmount!: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() supplierId?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() requiresQuotes?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() expectedDelivery?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
