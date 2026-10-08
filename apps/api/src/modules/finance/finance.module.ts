import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceTransaction } from './finance-transaction.entity';
import { PettyCashEntry } from './petty-cash.entity';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FinanceTransaction, PettyCashEntry])],
  providers: [FinanceService],
  controllers: [FinanceController],
  exports: [FinanceService],
})
export class FinanceModule {}
