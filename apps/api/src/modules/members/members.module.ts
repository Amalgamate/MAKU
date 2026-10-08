import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Member } from './member.entity';
import { MemberSequence } from './member-sequence.entity';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { Cig } from '../cigs/cig.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, MemberSequence, Cig]),
    MulterModule.register({ dest: './uploads' }),
  ],
  providers: [MembersService],
  controllers: [MembersController],
  exports: [MembersService],
})
export class MembersModule {}
