import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaterVoucher } from './water-voucher.entity';
import { WaterVouchersService } from './water-vouchers.service';
import { WaterVouchersController } from './water-vouchers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WaterVoucher])],
  providers: [WaterVouchersService],
  controllers: [WaterVouchersController],
  exports: [WaterVouchersService],
})
export class WaterVouchersModule {}
