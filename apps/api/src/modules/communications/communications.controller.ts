import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommunicationsService } from './communications.service';
import { SendSmsDto } from './dto/send-sms.dto';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { UserRole } from '@maku/shared-types';

@ApiTags('Communications')
@ApiBearerAuth()
@Controller('communications')
export class CommunicationsController {
  constructor(private readonly svc: CommunicationsService) {}

  // POST /v1/communications/sms
  @Post('sms')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Send an SMS to a recipient or group' })
  async sendSms(
    @Body() dto: SendSmsDto,
    @CurrentUser() caller: JwtPayload,
  ) {
    return this.svc.sendSms(dto, caller.sub);
  }

  // GET /v1/communications/sms
  @Get('sms')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get recent SMS logs' })
  async getLogs() {
    return this.svc.getLogs();
  }
}
