import { IsEnum, IsISO8601, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PettyCashAction } from '../petty-cash.entity';

export class CreatePettyCashDto {
  @ApiProperty({ example: '2026-10-06' })
  @IsISO8601()
  entryDate!: string;

  @ApiProperty({ enum: PettyCashAction })
  @IsEnum(PettyCashAction)
  action!: PettyCashAction;

  @ApiProperty({ example: 'Office supplies — pens and notebooks' })
  @IsString() @MinLength(3)
  description!: string;

  @ApiProperty({ example: 500 })
  @Type(() => Number) @IsNumber() @Min(0.01)
  amount!: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  receiptRef?: string;
}
