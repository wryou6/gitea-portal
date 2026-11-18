import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import type { AppConfig } from '../config/env.js';
import { encodeSession, readSession, type PortalSession } from '../auth/session.js';
import { registerAuthMiddleware } from './auth-middleware.js';

const config: AppConfig = {
  giteaBaseUrl: 'https://gitea.example.test',
  oauthClientId: 'client',
  oauthClientSecret: 'secret',
  oauthRedirectUri: 'https://portal.example.test/auth/callback',
  oauthScope: 'read:user',
  giteaTimeoutMs: 1000,
  sessionSecret: 'a-test-session-secret-with-sufficient-entropy',
  sessionIdleTimeoutMs: 43_200_000,
  sessionAbsoluteTimeoutMs: 2_592_000_000,
  webOrigin: 'https://portal.example.test/',
  port: 3001,
};

function makeSession(): PortalSession {
  const now = Date.now();
  return {
    version: 2,
    login: 'engineer',
    accessToken: 'expired-access-token',
    refreshToken: 'current-refresh-token',
    accessTokenExpiresAt: now + 10_000,
    issuedAt: now,
    lastActivityAt: now,
    absoluteExpiresAt: now + 86_400_000,
    csrfToken: 'csrf-token',
  };
}

test('preflight refresh updates the session cookie before protected API handling', async () => {
  const previousFetch = globalThis.fetch;
  let refreshCalls = 0;
  globalThis.fetch = async () => {
    refreshCalls += 1;
    await new Promise((resolve) => setTimeout(resolve, 10));
    return new Response(JSON.stringify({
      access_token: 'renewed-access-token',
      refresh_token: 'rotated-refresh-token',
      expires_in: 3600,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  const app = Fastify();
  registerAuthMiddleware(app, config);
  app.get('/api/secure', async (request) => ({ login: readSession(request, config)?.login }));
  const cookie = `portal_session=${encodeSession(makeSession(), config.sessionSecret)}`;

  try {
    const responses = await Promise.all([
      app.inject({ method: 'GET', url: '/api/secure', headers: { cookie } }),
      app.inject({ method: 'GET', url: '/api/secure', headers: { cookie } }),
    ]);
    assert.equal(refreshCalls, 1);
    assert.deepEqual(responses.map((response) => response.json()), [
      { login: 'engineer' },
      { login: 'engineer' },
    ]);
    assert.ok(responses.every((response) => response.headers['set-cookie']?.toString().includes('Secure')));
  } finally {
    globalThis.fetch = previousFetch;
    await app.close();
  }
});
