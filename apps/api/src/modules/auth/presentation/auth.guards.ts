import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RoleName } from '../domain/auth.types';
import { AuthenticationService } from '../application/authentication.service';
import { SessionService } from '../application/session.service';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
export interface AuthenticatedRequest {
  headers: { cookie?: string };
  ip?: string;
  currentAccount?: NonNullable<Awaited<ReturnType<AuthenticationService['getCurrentAccount']>>>;
}

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private readonly sessions: SessionService,
    private readonly auth: AuthenticationService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const accountId = await this.sessions.getAccountId(
      readCookie(request.headers.cookie, this.sessions.cookieName),
    );
    const account = accountId ? await this.auth.getCurrentAccount(accountId) : null;
    if (!account) throw new UnauthorizedException({ message: 'Authentication is required.' });
    request.currentAccount = account;
    return true;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return required.some((role) => request.currentAccount?.roles.includes(role));
  }
}

export function readCookie(header: string | undefined, name: string): string | undefined {
  return header
    ?.split(';')
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}
