import { IsArray, IsEnum, IsISO8601, IsNumber, IsOptional, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProjectStatus } from '../project.entity';

export class CreateProjectDto {
  @ApiProperty() @IsString() @MinLength(3) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ enum: ProjectStatus }) @IsOptional() @IsEnum(ProjectStatus) status?: ProjectStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() grantId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() ngoId?: string;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) budget?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100) progressPct?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() leadStaffId?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() milestones?: Array<{ title: string; dueDate: string; completed: boolean }>;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
