import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupplierCategory } from '../supplier.entity';

export class CreateSupplierDto {
  @ApiProperty() @IsString() @MinLength(2) name!: string;
  @ApiPropertyOptional({ enum: SupplierCategory }) @IsOptional() @IsEnum(SupplierCategory) category?: SupplierCategory;
  @ApiPropertyOptional() @IsOptional() @IsString() contactName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() physicalAddress?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() kraPin?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bankName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bankAccount?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() mpesaNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
