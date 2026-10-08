import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@maku/shared-types';
import { Transform } from 'class-transformer';

// Helper: treat empty string as undefined for optional fields
const EmptyToUndefined = () => Transform(({ value }) => (value === '' ? undefined : value));

export class CreateMemberDto {
  @ApiProperty({ example: 'Fatuma Hassan' })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @Matches(/^\d{7,8}$/, { message: 'nationalId must be 7 or 8 digits' })
  nationalId!: string;

  @ApiPropertyOptional({ example: '1985-06-15' })
  @IsOptional()
  @EmptyToUndefined()
  @IsISO8601()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @EmptyToUndefined()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ example: '0712345678' })
  @IsString()
  @Matches(/^(\+?254|0)7\d{8}$/, { message: 'phonePrimary must be a valid Kenyan mobile number' })
  phonePrimary!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @EmptyToUndefined()
  @IsString()
  @Matches(/^(\+?254|0)7\d{8}$/, { message: 'phoneSecondary must be a valid Kenyan mobile number' })
  phoneSecondary?: string;

  @ApiPropertyOptional({ example: 'Merti' })
  @IsOptional()
  @IsString()
  subLocation?: string;

  @ApiPropertyOptional({ example: 'Kula Mawe' })
  @IsOptional()
  @IsString()
  village?: string;

  @ApiPropertyOptional({ example: 0.5 })
  @IsOptional()
  @IsNumber()
  gpsLat?: number;

  @ApiPropertyOptional({ example: 38.5 })
  @IsOptional()
  @IsNumber()
  gpsLng?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  shareContributions?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  cattleCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  goatCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  camelCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  sheepCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  // ─── Next of kin ─────────────────────────────────────────────────────────

  @ApiPropertyOptional({ example: 'Hassan Wako' })
  @IsOptional()
  @IsString()
  nextOfKinName?: string;

  @ApiPropertyOptional({ example: 'Spouse' })
  @IsOptional()
  @IsString()
  nextOfKinRelationship?: string;

  @ApiPropertyOptional({ example: '0712345678' })
  @IsOptional()
  @EmptyToUndefined()
  @IsString()
  @Matches(/^(\+?254|0)7\d{8}$/, { message: 'nextOfKinPhone must be a valid Kenyan mobile number' })
  nextOfKinPhone?: string;

  // ─── Contributions ───────────────────────────────────────────────────────

  @ApiPropertyOptional({ description: 'Membership fee paid (KES 1,000 standard)', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  membershipFeePaid?: number;

  @ApiPropertyOptional({ description: 'Share capital paid (KES 5,000 standard)', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shareCapitalPaid?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  cigIds?: string[];
}
