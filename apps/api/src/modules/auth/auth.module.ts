import { Module } from '@nestjs/common';
import { AccountStatusService } from './application/account-status.service';
import { AuthenticationService } from './application/authentication.service';
import { LoginRateLimiterService } from './application/login-rate-limiter.service';
import { PasswordService } from './application/password.service';
import { SessionService } from './application/session.service';
import { AuthController } from './presentation/auth.controller';
import { RolesGuard, SessionAuthGuard } from './presentation/auth.guards';

@Module({
  controllers: [AuthController],
  providers: [
    AccountStatusService,
    AuthenticationService,
    LoginRateLimiterService,
    PasswordService,
    SessionService,
    SessionAuthGuard,
    RolesGuard,
  ],
  exports: [
    AccountStatusService,
    AuthenticationService,
    PasswordService,
    SessionAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
