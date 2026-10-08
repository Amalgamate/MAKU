import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ngo } from './ngo.entity';
import { NgosService } from './ngos.service';
import { NgosController } from './ngos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ngo])],
  providers: [NgosService],
  controllers: [NgosController],
  exports: [NgosService],
})
export class NgosModule {}
