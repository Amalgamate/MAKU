import { IsEnum, IsISO8601, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EmploymentType } from '../staff.entity';

export class CreateStaffDto {
  @ApiProperty() @IsString() @MinLength(2) fullName!: string;
  @ApiProperty() @IsString() @MinLength(2) role!: string;
  @ApiProperty() @IsISO8601() hireDate!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nationalId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() department?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional({ enum: EmploymentType }) @IsOptional() @IsEnum(EmploymentType) employmentType?: EmploymentType;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) basicSalary?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() nhifNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nssfNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() kraPin?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bankName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bankAccount?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() mpesaNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
