import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Document } from './document.entity';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    MulterModule.register({ dest: './uploads/documents' }),
  ],
  providers: [DocumentsService],
  controllers: [DocumentsController],
})
export class DocumentsModule {}
