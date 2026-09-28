import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../infrastructure/database/database.service';
import { securityAuditEvents } from '../../infrastructure/database/schema';

@Injectable()
export class SecurityAuditService {
  constructor(private readonly database: DatabaseService) {}

  async record(
    eventType: string,
    details: { accountId?: string; personnelCode?: string; ipAddress?: string },
  ): Promise<void> {
    // Credentials, session tokens, and password hashes are deliberately not accepted or persisted.
    await this.database.db.insert(securityAuditEvents).values({ eventType, ...details });
  }
}
