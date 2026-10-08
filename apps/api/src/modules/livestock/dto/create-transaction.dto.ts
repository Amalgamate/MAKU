import {
  IsEnum, IsISO8601, IsInt, IsNumber, IsOptional,
  IsString, IsUUID, Min, MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LivestockSpecies } from '../livestock-transaction.entity';

export class CreateLivestockTransactionDto {
  @ApiProperty({ example: '2026-10-06' })
  @IsISO8601()
  marketDate!: string;

  @ApiPropertyOptional({ example: 'Merti Market' })
  @IsOptional() @IsString()
  marketLocation?: string;

  @ApiProperty()
  @IsUUID()
  sellerMemberId!: string;

  @ApiProperty({ example: 'Ahmed Hassan' })
  @IsString() @MinLength(2)
  buyerName!: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  buyerPhone?: string;

  @ApiProperty({ enum: LivestockSpecies, default: LivestockSpecies.CATTLE })
  @IsEnum(LivestockSpecies)
  species!: LivestockSpecies;

  @ApiProperty({ example: 3 })
  @Type(() => Number) @IsInt() @Min(1)
  quantity!: number;

  @ApiPropertyOptional()
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  totalWeightKg?: number;

  @ApiProperty({ example: 45000 })
  @Type(() => Number) @IsNumber() @Min(0)
  pricePerUnit!: number;

  @ApiPropertyOptional({ example: 2000, description: 'MAKU commission (KES)' })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  makuCommission?: number;

  @ApiPropertyOptional({ example: 'mpesa' })
  @IsOptional() @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  mpesaReference?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUUID()
  cigId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  notes?: string;
}
