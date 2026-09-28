import assert from 'node:assert/strict';
import test from 'node:test';

import { AuthorizationService } from './authorization.service';

const authorization = new AuthorizationService();

test('supervisors can access any teacher-owned resource', () => {
  assert.doesNotThrow(() =>
    authorization.requireTeacherOwnership(
      { id: 'account-1', personnelCode: '100', roles: ['SUPERVISOR'], teacher: null },
      'teacher-2',
    ),
  );
});

test('teachers cannot access a different teacher resource', () => {
  assert.throws(() =>
    authorization.requireTeacherOwnership(
      { id: 'account-1', personnelCode: '100', roles: ['TEACHER'], teacher: { id: 'teacher-1' } },
      'teacher-2',
    ),
  );
});
