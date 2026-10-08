import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly svc: DashboardService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'Get all dashboard KPIs across all modules' })
  async kpis() {
    return this.svc.getKpis();
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get recent activity across all modules' })
  async activity() {
    return this.svc.getRecentActivity();
  }
}
