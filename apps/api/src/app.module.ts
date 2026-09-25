import { Module } from '@nestjs/common';

import { ConfigurationModule } from './infrastructure/configuration/configuration.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [ConfigurationModule, DatabaseModule, HealthModule],
})
export class AppModule {}
