import assert from 'node:assert/strict';
import test from 'node:test';

import { PasswordService } from './password.service';

test('hashes passwords and only verifies the matching password', async () => {
  const passwords = new PasswordService();
  const hash = await passwords.hash('correct horse battery staple');
  assert.match(hash, /^scrypt\$/);
  assert.ok(!hash.includes('correct horse battery staple'));
  assert.equal(await passwords.verify('correct horse battery staple', hash), true);
  assert.equal(await passwords.verify('incorrect', hash), false);
});
