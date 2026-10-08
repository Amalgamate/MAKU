import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrgSettings } from './org-settings.entity';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { WebsiteModule } from '../website/website.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrgSettings]), WebsiteModule],
  providers: [SettingsService],
  controllers: [SettingsController],
  exports: [SettingsService],
})
export class SettingsModule {}
