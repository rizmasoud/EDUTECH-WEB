import { Module } from '@nestjs/common';

import { HealthController } from './presentation/health.controller';
import { HealthApplicationService } from './presentation/health-application.service';
import { HealthService } from './presentation/health.service';

@Module({
  controllers: [HealthController],
  providers: [HealthApplicationService, HealthService],
})
export class HealthModule {}
