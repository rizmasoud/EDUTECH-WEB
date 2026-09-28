import { Injectable, UnauthorizedException } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DatabaseService } from '../../../infrastructure/database/database.service';
import { accountRoles, accounts, roles, teachers } from '../../../infrastructure/database/schema';
import { SecurityAuditService } from '../../security/security-audit.service';
import { AuthenticatedAccount, RoleName } from '../domain/auth.types';
import { PasswordService } from './password.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly database: DatabaseService,
    private readonly passwords: PasswordService,
    private readonly audit: SecurityAuditService,
  ) {}

  async authenticate(
    personnelCode: string,
    password: string,
    ipAddress?: string,
  ): Promise<AuthenticatedAccount> {
    const [account] = await this.database.db
      .select()
      .from(accounts)
      .where(eq(accounts.personnelCode, personnelCode))
      .limit(1);
    if (
      !account ||
      !account.isActive ||
      !(await this.passwords.verify(password, account.passwordHash))
    ) {
      await this.audit.record('AUTH_LOGIN_FAILED', { personnelCode, ipAddress });
      throw new UnauthorizedException({ message: 'Invalid personnel code or password.' });
    }
    const user = await this.getCurrentAccount(account.id);
    if (!user) throw new UnauthorizedException();
    await this.audit.record('AUTH_LOGIN_SUCCEEDED', {
      accountId: account.id,
      personnelCode,
      ipAddress,
    });
    return user;
  }

  async getCurrentAccount(accountId: string): Promise<AuthenticatedAccount | null> {
    const [account] = await this.database.db
      .select({
        id: accounts.id,
        personnelCode: accounts.personnelCode,
        isActive: accounts.isActive,
      })
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .limit(1);
    if (!account || !account.isActive) return null;
    const roleRows = await this.database.db
      .select({ name: roles.name })
      .from(accountRoles)
      .innerJoin(roles, eq(accountRoles.roleId, roles.id))
      .where(eq(accountRoles.accountId, account.id));
    const [teacher] = await this.database.db
      .select({ id: teachers.id })
      .from(teachers)
      .where(eq(teachers.accountId, account.id))
      .limit(1);
    return {
      id: account.id,
      personnelCode: account.personnelCode,
      roles: roleRows.map((row) => row.name as RoleName),
      teacher: teacher ?? null,
    };
  }
}
