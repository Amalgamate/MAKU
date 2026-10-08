import {
  IsEnum, IsISO8601, IsNumber, IsOptional,
  IsString, IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFeedlotDto {
  @IsString()
  animalTag!: string;

  @IsString()
  species!: string;

  @IsOptional() @IsUUID()
  memberId?: string;

  @IsISO8601()
  intakeDate!: string;

  @Type(() => Number) @IsNumber()
  intakeWeightKg!: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  dailyFeedCostKes?: number;

  @IsOptional() @IsString()
  notes?: string;
}

export class UpdateFeedlotDto {
  @IsOptional() @Type(() => Number) @IsNumber()
  currentWeightKg?: number;

  @IsOptional() @IsEnum(['active', 'sold', 'died'])
  status?: 'active' | 'sold' | 'died';

  @IsOptional() @IsISO8601()
  saleDate?: string;

  @IsOptional() @Type(() => Number) @IsNumber()
  salePriceKes?: number;
}
