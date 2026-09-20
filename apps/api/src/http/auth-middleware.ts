import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config/env.js';
import { readSession } from '../auth/session.js';

export function registerAuthMiddleware(app: FastifyInstance, config: AppConfig): void {
  app.addHook('preHandler', async (request, reply) => {
    if (!request.url.startsWith('/api/')) return;
    if (request.url === '/api/session') return;
    const session = readSession(request, config);
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method) && session && !request.headers.authorization) {
      const csrfCookie = request.headers.cookie?.match(/(?:^|;\s*)portal_csrf=([^;]+)/)?.[1];
      if (!csrfCookie || csrfCookie !== request.headers['x-csrf-token']) return reply.code(403).send({ error: 'CSRF validation failed' });
    }
    if (request.headers.authorization || session) return;
    return reply.code(401).send({ error: 'Authentication required' });
  });
}
