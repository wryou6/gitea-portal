import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import type { AppConfig } from '../config/env.js';
import { registerHttpRoutes } from './routes.js';

const config: AppConfig = {
  giteaBaseUrl: 'https://gitea.example.test',
  oauthClientId: 'client',
  oauthClientSecret: 'secret',
  oauthRedirectUri: 'https://portal.example.test/issue/auth/callback',
  oauthScope: 'read:user',
  giteaTimeoutMs: 1000,
  sessionSecret: 'a-test-session-secret-with-sufficient-entropy',
  sessionIdleTimeoutMs: 43_200_000,
  sessionAbsoluteTimeoutMs: 2_592_000_000,
  webOrigin: 'https://portal.example.test/issue/',
  port: 3001,
};

test('logout clears only the Portal cookies at the configured subpath', async () => {
  const app = Fastify();
  registerHttpRoutes(app, config);
  const response = await app.inject({ method: 'POST', url: '/auth/logout' });
  const cookies = response.headers['set-cookie']?.toString() ?? '';
  assert.equal(response.statusCode, 204);
  assert.match(cookies, /portal_session=;[^,]*Max-Age=0; Path=\/issue; Secure/);
  assert.match(cookies, /portal_csrf=;[^,]*Max-Age=0; Path=\/issue; Secure/);
  await app.close();
});
