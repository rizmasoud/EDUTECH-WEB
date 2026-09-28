import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DatabaseService } from '../../../infrastructure/database/database.service';
import { accounts } from '../../../infrastructure/database/schema';
import { SecurityAuditService } from '../../security/security-audit.service';

@Injectable()
export class AccountStatusService {
  constructor(
    private readonly database: DatabaseService,
    private readonly audit: SecurityAuditService,
  ) {}

  async setActive(accountId: string, isActive: boolean): Promise<void> {
    const [account] = await this.database.db
      .update(accounts)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(accounts.id, accountId))
      .returning({ id: accounts.id, personnelCode: accounts.personnelCode });
    if (!account) throw new NotFoundException('Account not found.');
    await this.audit.record(isActive ? 'ACCOUNT_ACTIVATED' : 'ACCOUNT_DEACTIVATED', {
      accountId: account.id,
      personnelCode: account.personnelCode,
    });
  }
}
