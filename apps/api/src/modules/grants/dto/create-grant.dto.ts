import { IsEnum, IsISO8601, IsNumber, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { GrantStatus } from '../grant.entity';

export class CreateGrantDto {
  @ApiProperty() @IsString() @MinLength(3) title!: string;
  @ApiProperty() @IsString() @MinLength(2) donorName!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() ngoId?: string;
  @ApiPropertyOptional({ enum: GrantStatus }) @IsOptional() @IsEnum(GrantStatus) status?: GrantStatus;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) amountRequested?: number;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() deadline?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() focusArea?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reportingSchedule?: string;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() nextReportDue?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
