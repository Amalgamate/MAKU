import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Cig } from './cig.entity';
import { CigMeeting } from './cig-meeting.entity';
import { CigDocument } from './cig-document.entity';
import { CigsService } from './cigs.service';
import { CigsController } from './cigs.controller';
import { Member } from '../members/member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cig, CigMeeting, CigDocument, Member]),
    MulterModule.register({ dest: './uploads/cigs' }),
  ],
  providers: [CigsService],
  controllers: [CigsController],
  exports: [CigsService],
})
export class CigsModule {}
