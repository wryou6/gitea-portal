import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config/env.js';
import { oauthAuthorizeUrl, exchangeOAuthCode, oauthState } from '../auth/oauth.js';
import { clearSession, readSession } from '../auth/session.js';

export function registerHttpRoutes(app: FastifyInstance, config: AppConfig): void {
  app.get('/auth/login', async (_request, reply) => reply.redirect(oauthAuthorizeUrl(config, oauthState())));
  app.get('/auth/callback', async (request, reply) => {
    const code = (request.query as { code?: string }).code;
    if (!code) return reply.code(400).send({ error: 'OAuth code is required' });
    await exchangeOAuthCode(config, code, reply);
    return reply.redirect('/');
  });
  app.post('/auth/logout', async (_request, reply) => { clearSession(reply); return reply.code(204).send(); });
  app.get('/api/session', async (request, reply) => {
    const session = readSession(request, config);
    if (!session) return reply.code(401).send({ error: 'Authentication required' });
    return { login: session.login };
  });
}
