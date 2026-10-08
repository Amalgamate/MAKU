import { IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CigDocumentCategory } from '../cig-document.entity';
import { Type } from 'class-transformer';

export class CreateCigDocumentDto {
  @ApiProperty({ example: 'AGM Minutes March 2026' })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiPropertyOptional({ enum: CigDocumentCategory })
  @IsOptional()
  @IsEnum(CigDocumentCategory)
  category?: CigDocumentCategory;

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
