import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseTransaction } from './purchase-transaction.entity';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseTransaction])],
  providers: [PurchasesService],
  controllers: [PurchasesController],
  exports: [PurchasesService],
})
export class PurchasesModule {}
