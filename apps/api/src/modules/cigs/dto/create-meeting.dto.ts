import { IsISO8601, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMeetingDto {
  @ApiProperty({ example: '2026-10-10' })
  @IsISO8601()
  date!: string;

  @ApiProperty({ example: 'Monthly review and milk collection planning' })
  @IsString()
  @MinLength(5)
  agenda!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  minutes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actionItems?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  attendanceCount?: number;

  @ApiPropertyOptional({ example: 'Merti Community Hall' })
  @IsOptional()
  @IsString()
  venue?: string;
}
