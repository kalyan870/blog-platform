import test from 'node:test';
import assert from 'node:assert/strict';
import { getJwtSecret, generateToken } from '../middleware/auth.js';

test('JWT secret refuses missing or short values', () => {
  const original = process.env.JWT_SECRET;
  try {
    delete process.env.JWT_SECRET;
    assert.throws(getJwtSecret, /at least 32 characters/);
    process.env.JWT_SECRET = 'too-short';
    assert.throws(getJwtSecret, /at least 32 characters/);
  } finally {
    if (original === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = original;
  }
});

test('token signing uses the configured secret', () => {
  const original = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'a'.repeat(32);
  try {
    assert.equal(typeof generateToken({ id: 1, email: 'test@example.com' }), 'string');
  } finally {
    if (original === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = original;
  }
});
