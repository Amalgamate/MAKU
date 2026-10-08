import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsLog } from './sms-log.entity';
import { CommunicationsService } from './communications.service';
import { CommunicationsController } from './communications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SmsLog])],
  providers: [CommunicationsService],
  controllers: [CommunicationsController],
})
export class CommunicationsModule {}
