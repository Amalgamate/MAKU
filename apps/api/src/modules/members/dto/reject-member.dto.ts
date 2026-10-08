import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectMemberDto {
  @ApiProperty({ example: 'Duplicate registration — existing member MAKU-2026-0042' })
  @IsString()
  @MinLength(5)
  reason!: string;
}
