import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrgSettings } from './org-settings.entity';
import { UpdateOrgSettingsDto } from './dto/org-settings.dto';
import { WebsiteService } from '../website/website.service';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(OrgSettings)
    private readonly repo: Repository<OrgSettings>,
    private readonly websiteService: WebsiteService,
  ) {}

  async getOrgSettings(): Promise<OrgSettings> {
    const existing = await this.repo.findOne({ where: { id: '1' } });
    if (!existing) {
      const defaults = this.repo.create({
        id: '1',
        orgName: 'MAKU',
        tagline: null,
        logoUrl: null,
        primaryColor: '#7e2710',
      });
      return this.repo.save(defaults);
    }
    return existing;
  }

  async updateOrgSettings(dto: Partial<UpdateOrgSettingsDto>): Promise<OrgSettings> {
    const existing = await this.getOrgSettings();
    Object.assign(existing, dto);
    const saved = await this.repo.save(existing);

    // Keep website_settings.logoUrl in sync so the public site picks it up
    // from GET /website/settings without a separate admin action.
    if ('logoUrl' in dto) {
      await this.websiteService.updateSettings({ logoUrl: dto.logoUrl ?? null });
    }

    return saved;
  }
}
