import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../shared/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check — returns 200 OK when the API is running' })
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
