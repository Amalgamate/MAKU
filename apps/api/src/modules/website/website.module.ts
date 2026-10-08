import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebsiteSettings } from './website.entity';
import { WebsiteService } from './website.service';
import { WebsiteController } from './website.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WebsiteSettings])],
  providers: [WebsiteService],
  controllers: [WebsiteController],
  exports: [WebsiteService],
})
export class WebsiteModule {}
