import {
  IsArray, IsEnum, IsISO8601, IsNumber, IsOptional,
  IsString, IsUUID, Min, MinLength, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PurchaseType } from '../purchase-transaction.entity';

class LineItemDto {
  @IsString() item!: string;
  @Type(() => Number) @IsNumber() @Min(0) qty!: number;
  @Type(() => Number) @IsNumber() @Min(0) unitPrice!: number;
  @Type(() => Number) @IsNumber() @Min(0) total!: number;
}

export class CreatePurchaseDto {
  @ApiProperty({ example: '2026-10-06' }) @IsISO8601() transactionDate!: string;
  @ApiProperty({ enum: PurchaseType }) @IsEnum(PurchaseType) type!: PurchaseType;
  @ApiProperty() @IsString() @MinLength(3) description!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() supplierId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() buyerName?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() memberId?: string;
  @ApiProperty({ type: [LineItemDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => LineItemDto) lineItems!: LineItemDto[];
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) taxAmount?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() paymentMethod?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() paymentReference?: string;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() dueDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
