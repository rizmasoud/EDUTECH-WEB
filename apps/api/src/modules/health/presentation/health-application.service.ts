import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DatabaseService } from '../../../infrastructure/database/database.service';
import { GetHealthStatusUseCase, HealthStatus } from '../application/get-health-status.use-case';

@Injectable()
export class HealthApplicationService {
  private readonly useCase: GetHealthStatusUseCase;

  constructor(database: DatabaseService, configService: ConfigService) {
    this.useCase = new GetHealthStatusUseCase(
      database,
      configService.getOrThrow<string>('NODE_ENV'),
      '0.1.0',
    );
  }

  async getHealth(): Promise<HealthStatus> {
    return this.useCase.execute();
  }
}
