import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateOrgSettingsDto } from './dto/org-settings.dto';
import { Public } from '../../shared/decorators/public.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '@maku/shared-types';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly svc: SettingsService) {}

  /** GET /settings/org — public, no auth required */
  @Public()
  @Get('org')
  @ApiOperation({ summary: 'Get organisation settings' })
  async getOrgSettings() {
    return this.svc.getOrgSettings();
  }

  /** PATCH /settings/org — admin only */
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch('org')
  @ApiOperation({ summary: 'Update organisation settings' })
  async updateOrgSettings(@Body() dto: UpdateOrgSettingsDto) {
    return this.svc.updateOrgSettings(dto);
  }
}
