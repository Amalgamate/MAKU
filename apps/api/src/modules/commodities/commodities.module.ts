import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommodityTransaction } from './commodity-transaction.entity';
import { CommoditiesService } from './commodities.service';
import { CommoditiesController } from './commodities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CommodityTransaction])],
  providers: [CommoditiesService],
  controllers: [CommoditiesController],
  exports: [CommoditiesService],
})
export class CommoditiesModule {}
