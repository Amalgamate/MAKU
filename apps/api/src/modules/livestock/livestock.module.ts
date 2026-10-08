import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LivestockTransaction } from './livestock-transaction.entity';
import { LivestockService } from './livestock.service';
import { LivestockController } from './livestock.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LivestockTransaction])],
  providers: [LivestockService],
  controllers: [LivestockController],
  exports: [LivestockService],
})
export class LivestockModule {}
