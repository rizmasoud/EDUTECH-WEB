import { Provider, Logger } from '@nestjs/common';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { getPGliteDatabase } from './pglite-bootstrap';

export const DRIZZLE_DB = Symbol('DRIZZLE_DB');
export type DrizzleDb = PostgresJsDatabase<typeof schema> | any;

export const drizzleProvider: Provider = {
  provide: DRIZZLE_DB,
  useFactory: async (): Promise<DrizzleDb> => {
    const logger = new Logger('DrizzleProvider');
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString || connectionString === 'pglite' || process.env.USE_PGLITE === 'true') {
      logger.log('Using PGlite embedded PostgreSQL database engine');
      return getPGliteDatabase();
    }

    try {
      const maskedUrl = connectionString.replace(/:([^@]+)@/, ':***@');
      logger.log(`Configuring PostgreSQL connection pool with target: ${maskedUrl}`);

      const client = postgres(connectionString, {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 3,
        onnotice: () => {},
      });

      // Test connection
      await client`SELECT 1`;
      return drizzle(client, { schema });
    } catch (err: any) {
      logger.warn(`PostgreSQL connection failed (${err.message}). Falling back to PGlite.`);
      return getPGliteDatabase();
    }
  },
};
