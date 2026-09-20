import Fastify from 'fastify';
import type { AppConfig } from './config/env.js';
import { BoardRepository } from './persistence/board-repository.js';
import { registerErrorHandler } from './http/error-handler.js';
import { registerIssueRoutes } from './issues/issue-routes.js';
import { registerBoardRoutes } from './boards/board-routes.js';

export async function buildApp(config: AppConfig) {
  const app = Fastify({ logger: true });
  const boards = new BoardRepository();
  registerErrorHandler(app);
  app.get('/health', async () => ({ ok: true }));
  app.get('/api/session', async (request, reply) => {
    if (!request.headers.authorization) return reply.code(401).send({ error: 'Authentication required' });
    return { login: 'delegated-user' };
  });
  await registerIssueRoutes(app, config);
  registerBoardRoutes(app, config, boards);
  return app;
}
