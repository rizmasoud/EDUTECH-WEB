import { Controller, Get } from '@nestjs/common';

import { HealthStatus } from '../application/get-health-status.use-case';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth(): Promise<HealthStatus> {
    return this.healthService.getHealth();
  }
}
