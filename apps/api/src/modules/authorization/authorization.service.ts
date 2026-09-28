import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthenticatedAccount } from '../auth/domain/auth.types';

@Injectable()
export class AuthorizationService {
  requireRole(account: AuthenticatedAccount, role: 'SUPERVISOR' | 'TEACHER'): void {
    if (!account.roles.includes(role)) throw new ForbiddenException();
  }
  // Future resource modules must use this rather than trusting route identifiers.
  requireTeacherOwnership(account: AuthenticatedAccount, teacherId: string): void {
    if (account.roles.includes('SUPERVISOR')) return;
    if (!account.roles.includes('TEACHER') || account.teacher?.id !== teacherId)
      throw new ForbiddenException();
  }
}
