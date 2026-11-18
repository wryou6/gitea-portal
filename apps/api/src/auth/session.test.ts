import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeSession, encodeSession, type PortalSession } from './session.js';

const secret = 'a-test-session-secret-with-sufficient-entropy';
const now = 1_800_000_000_000;
const session: PortalSession = {
  version: 2,
  login: 'engineer',
  accessToken: 'access-token-value',
  refreshToken: 'refresh-token-value',
  accessTokenExpiresAt: now + 60_000,
  issuedAt: now,
  lastActivityAt: now,
  absoluteExpiresAt: now + 86_400_000,
};

test('encrypted session round-trips without exposing token text', () => {
  const encoded = encodeSession(session, secret);
  assert.equal(encoded.includes(session.accessToken), false);
  assert.equal(encoded.includes(session.refreshToken), false);
  assert.deepEqual(decodeSession(encoded, secret, 3_600_000, now), session);
});

test('session rejects ciphertext tampering and legacy signed cookies', () => {
  const encoded = encodeSession(session, secret);
  const tampered = `${encoded.slice(0, -1)}${encoded.endsWith('a') ? 'b' : 'a'}`;
  assert.equal(decodeSession(tampered, secret, 3_600_000, now), undefined);
  assert.equal(decodeSession('eyJsb2dpbiI6ImVuZ2luZWVyIn0.signature', secret, 3_600_000, now), undefined);
});

test('session enforces idle and absolute expiry', () => {
  const encoded = encodeSession(session, secret);
  assert.equal(decodeSession(encoded, secret, 30_000, now + 30_000), undefined);
  assert.equal(decodeSession(encoded, secret, 3_600_000, session.absoluteExpiresAt), undefined);
});
