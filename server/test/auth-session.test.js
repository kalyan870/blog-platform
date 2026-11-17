import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequireUser } from '../middleware/auth.js';

test('authenticated Clerk subject is attached as the request owner', () => {
  const req = {};
  let nextCalled = false;
  createRequireUser(() => ({ isAuthenticated: true, userId: 'user_clerk_1' }))(req, {}, () => { nextCalled = true; });
  assert.equal(req.userId, 'user_clerk_1');
  assert.equal(nextCalled, true);
});

test('unauthenticated request stops before a protected handler', () => {
  const res = { code: 0, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  let nextCalled = false;
  createRequireUser(() => ({ isAuthenticated: false, userId: null }))({}, res, () => { nextCalled = true; });
  assert.equal(res.code, 401);
  assert.equal(nextCalled, false);
});
