export interface HealthDatabase {
  isConnected(): Promise<boolean>;
}

export interface HealthStatus {
  status: 'ok' | 'degraded';
  version: string;
  environment: string;
  database: 'connected' | 'disconnected';
}

/** Application operation; it deliberately has no dependency on HTTP or NestJS. */
export class GetHealthStatusUseCase {
  constructor(
    private readonly database: HealthDatabase,
    private readonly environment: string,
    private readonly version: string,
  ) {}

  async execute(): Promise<HealthStatus> {
    const connected = await this.database.isConnected();
    return {
      status: connected ? 'ok' : 'degraded',
      version: this.version,
      environment: this.environment,
      database: connected ? 'connected' : 'disconnected',
    };
  }
}
