import { Injectable } from '@nestjs/common';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { createHash, randomBytes } from 'node:crypto';

import { DatabaseService } from '../../../infrastructure/database/database.service';
import { sessions } from '../../../infrastructure/database/schema';

@Injectable()
export class SessionService {
  readonly cookieName = 'edutech_session';
  private readonly durationMs = 8 * 60 * 60 * 1000;
  constructor(private readonly database: DatabaseService) {}

  async create(accountId: string): Promise<{ token: string; expiresAt: Date }> {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + this.durationMs);
    await this.database.db
      .insert(sessions)
      .values({ accountId, tokenHash: this.hash(token), expiresAt });
    return { token, expiresAt };
  }
  async getAccountId(token: string | undefined): Promise<string | null> {
    if (!token) return null;
    const [session] = await this.database.db
      .select({ accountId: sessions.accountId })
      .from(sessions)
      .where(
        and(
          eq(sessions.tokenHash, this.hash(token)),
          isNull(sessions.invalidatedAt),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .limit(1);
    return session?.accountId ?? null;
  }
  async invalidate(token: string | undefined): Promise<void> {
    if (!token) return;
    await this.database.db
      .update(sessions)
      .set({ invalidatedAt: new Date() })
      .where(eq(sessions.tokenHash, this.hash(token)));
  }
  private hash(token: string): string {
    return createHash('sha256').update(token).digest('base64url');
  }
}
