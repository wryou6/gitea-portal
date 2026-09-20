import Fastify from 'fastify';
import type { AppConfig } from './config/env.js';
import { BoardRepository } from './persistence/board-repository.js';
import { registerErrorHandler } from './http/error-handler.js';
import { registerIssueRoutes } from './issues/issue-routes.js';
import { registerBoardRoutes } from './boards/board-routes.js';
import { loadConventions } from './workflows/convention-loader.js';
import { registerHttpRoutes } from './http/routes.js';
import { registerAuthMiddleware } from './http/auth-middleware.js';
import { registerWorkflowConventionRoutes } from './http/workflow-convention-routes.js';
import { registerRequestMetrics } from './telemetry/request-metrics.js';

export async function buildApp(config: AppConfig) {
  const app = Fastify({ logger: true });
  const boards = new BoardRepository(config.boardStorePath);
  await boards.initialize();
  const conventions = await loadConventions(config.workflowConfigPath);
  registerErrorHandler(app);
  registerRequestMetrics(app);
  registerHttpRoutes(app, config);
  registerAuthMiddleware(app, config);
  app.get('/', async (_request, reply) => reply.redirect(config.webOrigin));
  app.get('/health', async () => ({ ok: true }));
  await registerIssueRoutes(app, config);
  registerBoardRoutes(app, config, boards, conventions);
  registerWorkflowConventionRoutes(app, conventions);
  return app;
}
