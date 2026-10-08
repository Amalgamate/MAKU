import { IsBoolean, IsISO8601, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNgoDto {
  @ApiProperty() @IsString() @MinLength(2) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() country?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactPhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() focusAreas?: string;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() partnershipStart?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() mouSigned?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() mouExpiry?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
