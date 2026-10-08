import { IsEnum, IsISO8601, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CommodityType, CommodityAction } from '../commodity-transaction.entity';

export class CreateCommodityDto {
  @ApiProperty({ enum: CommodityType }) @IsEnum(CommodityType) commodityType!: CommodityType;
  @ApiProperty({ enum: CommodityAction }) @IsEnum(CommodityAction) action!: CommodityAction;
  @ApiProperty() @IsISO8601() transactionDate!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() memberId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() cigId?: string;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) quantity!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() unit?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() qualityGrade?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) unitPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() buyerName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() paymentMethod?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
