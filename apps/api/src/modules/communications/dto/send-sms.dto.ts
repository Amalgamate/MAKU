import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class SendSmsDto {
  @IsString() @MinLength(1)
  message!: string;

  @IsOptional() @IsString()
  recipient?: string;

  @IsOptional() @Type(() => Number) @IsInt()
  memberCount?: number;
}
