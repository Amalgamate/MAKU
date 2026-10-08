import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcurementOrder } from './procurement-order.entity';
import { ProcurementService } from './procurement.service';
import { ProcurementController } from './procurement.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProcurementOrder])],
  providers: [ProcurementService],
  controllers: [ProcurementController],
  exports: [ProcurementService],
})
export class ProcurementModule {}
