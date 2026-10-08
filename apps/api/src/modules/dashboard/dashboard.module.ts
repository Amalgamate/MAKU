import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Member } from '../members/member.entity';
import { Cig } from '../cigs/cig.entity';
import { LivestockTransaction } from '../livestock/livestock-transaction.entity';
import { WaterVoucher } from '../water-vouchers/water-voucher.entity';
import { FinanceTransaction } from '../finance/finance-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Member, Cig, LivestockTransaction, WaterVoucher, FinanceTransaction])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
