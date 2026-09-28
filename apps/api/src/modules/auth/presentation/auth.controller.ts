import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';

import { AuthenticationService } from '../application/authentication.service';
import { LoginRateLimiterService } from '../application/login-rate-limiter.service';
import { SessionService } from '../application/session.service';
import { AuthenticatedRequest, readCookie, SessionAuthGuard } from './auth.guards';
import { SecurityAuditService } from '../../security/security-audit.service';

const loginSchema = z.object({
  personnelCode: z.string().trim().min(1).max(128),
  password: z.string().min(1).max(1024),
});

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly sessions: SessionService,
    private readonly limiter: LoginRateLimiterService,
    private readonly audit: SecurityAuditService,
  ) {}
  @Post('login')
  async login(
    @Body() body: unknown,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: CookieResponse,
  ) {
    const credentials = loginSchema.parse(body);
    const rateKey = `${request.ip}:${credentials.personnelCode}`;
    this.limiter.check(rateKey);
    try {
      const account = await this.authentication.authenticate(
        credentials.personnelCode,
        credentials.password,
        request.ip,
      );
      this.limiter.reset(rateKey);
      const session = await this.sessions.create(account.id);
      response.cookie(this.sessions.cookieName, session.token, cookieOptions(session.expiresAt));
      return { account };
    } catch (error) {
      this.limiter.recordFailure(rateKey);
      throw error;
    }
  }
  @Get('me')
  @UseGuards(SessionAuthGuard)
  me(@Req() request: AuthenticatedRequest) {
    return { account: request.currentAccount };
  }
  @Post('logout')
  @HttpCode(204)
  @UseGuards(SessionAuthGuard)
  async logout(
    @Req() request: AuthenticatedRequest,
    @Headers('cookie') cookie: string | undefined,
    @Res({ passthrough: true }) response: CookieResponse,
  ): Promise<void> {
    await this.sessions.invalidate(readCookie(cookie, this.sessions.cookieName));
    await this.audit.record('AUTH_LOGOUT', {
      accountId: request.currentAccount?.id,
      personnelCode: request.currentAccount?.personnelCode,
      ipAddress: request.ip,
    });
    response.clearCookie(this.sessions.cookieName, cookieOptions());
  }
}
interface CookieResponse {
  cookie(name: string, value: string, options: ReturnType<typeof cookieOptions>): void;
  clearCookie(name: string, options: ReturnType<typeof cookieOptions>): void;
}

function cookieOptions(expires?: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    ...(expires ? { expires } : {}),
  };
}
