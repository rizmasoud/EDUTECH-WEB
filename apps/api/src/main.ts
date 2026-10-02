import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Set global API prefix matching Docs/api/api-specification.md
  app.setGlobalPrefix('api/v1', {
    exclude: ['health'],
  });

  // Global exception filter for standardized error contracts
  app.useGlobalFilters(new HttpExceptionFilter());

  // Enable CORS for frontend communication
  app.enableCors({
    origin: true, // allow any origin in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_PORT') || 4000;
  const env = configService.get<string>('NODE_ENV') || 'development';

  await app.listen(port);
  logger.log(`EduTech API running on port ${port} [env=${env}]`);
  logger.log(`Health endpoint available at http://localhost:${port}/health`);
}

bootstrap().catch((err) => {
  console.error('Fatal error during NestJS bootstrap:', err);
  process.exit(1);
});
