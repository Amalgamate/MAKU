import { PartialType } from '@nestjs/swagger';
import { CreateCigDto } from './create-cig.dto';
export class UpdateCigDto extends PartialType(CreateCigDto) {}
