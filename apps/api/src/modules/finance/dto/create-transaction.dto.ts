import { IsEnum, IsISO8601, IsNumber, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TransactionType, TransactionCategory, PaymentMethod } from '../finance-transaction.entity';

export class CreateFinanceTransactionDto {
  @ApiProperty({ example: '2026-10-06' })
  @IsISO8601()
  transactionDate!: string;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiProperty({ enum: TransactionCategory })
  @IsEnum(TransactionCategory)
  category!: TransactionCategory;

  @ApiProperty({ example: 'Commission from livestock market day' })
  @IsString() @MinLength(3)
  description!: string;

  @ApiProperty({ example: 5000 })
  @Type(() => Number) @IsNumber() @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional() @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  referenceNumber?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUUID()
  memberId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUUID()
  livestockTransactionId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUUID()
  voucherId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  notes?: string;
}
