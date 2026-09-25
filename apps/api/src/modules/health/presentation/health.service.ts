import { Injectable } from '@nestjs/common';

import { HealthStatus } from '../application/get-health-status.use-case';
import { HealthApplicationService } from './health-application.service';

@Injectable()
export class HealthService {
  constructor(private readonly applicationService: HealthApplicationService) {}

  async getHealth(): Promise<HealthStatus> {
    return this.applicationService.getHealth();
  }
}
