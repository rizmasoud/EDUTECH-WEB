import { Module } from '@nestjs/common';

import { ConfigurationModule } from './infrastructure/configuration/configuration.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { SecurityModule } from './modules/security/security.module';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    SecurityModule,
    AuthorizationModule,
    HealthModule,
    AuthModule,
  ],
})
export class AppModule {}
