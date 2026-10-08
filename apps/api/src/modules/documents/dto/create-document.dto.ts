import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDocumentDto {
  @IsString()
  title!: string;

  @IsOptional() @IsString()
  category?: string;

  @IsString()
  fileUrl!: string;

  @IsOptional() @Type(() => Number) @IsInt()
  fileSize?: number;

  @IsOptional() @IsString()
  mimeType?: string;

  @IsOptional() @Type(() => Number) @IsInt()
  year?: number;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsUUID()
  cigId?: string;
}
