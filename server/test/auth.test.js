import test from 'node:test';
import assert from 'node:assert/strict';
import { authenticateToken } from '../middleware/auth.js';

test('protected routes reject a missing bearer session', async () => {
  const req = { headers: {} };
  let statusCode;
  let body;
  let nextCalled = false;
  const res = {
    status(code) { statusCode = code; return this; },
    json(value) { body = value; return this; },
  };
  await authenticateToken(req, res, () => { nextCalled = true; });
  assert.equal(statusCode, 401);
  assert.equal(body.error, 'Sign in required.');
  assert.equal(nextCalled, false);
});

test('protected routes reject a malformed bearer session', async () => {
  const originalSecret = process.env.CLERK_SECRET_KEY;
  const originalParties = process.env.CLERK_AUTHORIZED_PARTIES;
  process.env.CLERK_SECRET_KEY = 'sk_test_invalid';
  process.env.CLERK_AUTHORIZED_PARTIES = 'http://localhost:3000';
  const req = { headers: { authorization: 'Bearer invalid' } };
  let statusCode;
  const res = { status(code) { statusCode = code; return this; }, json() { return this; } };
  try {
    await authenticateToken(req, res, () => {});
    assert.equal(statusCode, 401);
  } finally {
    if (originalSecret === undefined) delete process.env.CLERK_SECRET_KEY;
    else process.env.CLERK_SECRET_KEY = originalSecret;
    if (originalParties === undefined) delete process.env.CLERK_AUTHORIZED_PARTIES;
    else process.env.CLERK_AUTHORIZED_PARTIES = originalParties;
  }
});
