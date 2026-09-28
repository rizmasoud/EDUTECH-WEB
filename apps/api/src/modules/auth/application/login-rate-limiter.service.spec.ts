import assert from 'node:assert/strict';
import test from 'node:test';

import { LoginRateLimiterService } from './login-rate-limiter.service';

test('blocks repeated login failures and resets after successful authentication', () => {
  const limiter = new LoginRateLimiterService();
  for (let attempt = 0; attempt < 5; attempt += 1) limiter.recordFailure('127.0.0.1:100');
  assert.throws(() => limiter.check('127.0.0.1:100'));
  limiter.reset('127.0.0.1:100');
  assert.doesNotThrow(() => limiter.check('127.0.0.1:100'));
});
