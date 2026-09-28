import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

interface AttemptWindow {
  count: number;
  resetAt: number;
}

@Injectable()
export class LoginRateLimiterService {
  private readonly attempts = new Map<string, AttemptWindow>();
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000;

  check(key: string): void {
    const attempt = this.attempts.get(key);
    if (attempt && attempt.resetAt > Date.now() && attempt.count >= this.maxAttempts) {
      throw new HttpException(
        { message: 'Too many login attempts. Please try again later.' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
  recordFailure(key: string): void {
    const now = Date.now();
    const attempt = this.attempts.get(key);
    this.attempts.set(
      key,
      !attempt || attempt.resetAt <= now
        ? { count: 1, resetAt: now + this.windowMs }
        : { ...attempt, count: attempt.count + 1 },
    );
  }
  reset(key: string): void {
    this.attempts.delete(key);
  }
}
