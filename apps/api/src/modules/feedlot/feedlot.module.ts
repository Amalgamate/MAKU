import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedlotAnimal } from './feedlot.entity';
import { FeedlotService } from './feedlot.service';
import { FeedlotController } from './feedlot.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FeedlotAnimal])],
  providers: [FeedlotService],
  controllers: [FeedlotController],
  exports: [FeedlotService],
})
export class FeedlotModule {}
