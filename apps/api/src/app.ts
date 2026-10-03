import Fastify from "fastify";
import type { AppConfig } from "./config/env.js";
import { registerErrorHandler } from "./http/error-handler.js";
import { registerIssueRoutes } from "./issues/issue-routes.js";
import { registerHttpRoutes } from "./http/routes.js";
import { registerAuthMiddleware } from "./http/auth-middleware.js";
import { registerRequestMetrics } from "./telemetry/request-metrics.js";
import { registerRepositoryRoutes } from "./repositories/repository-routes.js";
import { registerStatusDefinitionRoutes } from "./http/status-definition-routes.js";

export async function buildApp(config: AppConfig) {
  const app = Fastify({ logger: true });
  registerErrorHandler(app);
  registerRequestMetrics(app);
  registerHttpRoutes(app, config);
  registerAuthMiddleware(app, config);
  app.get("/", async (_request, reply) => reply.redirect(config.webOrigin));
  app.get("/health", async () => ({ ok: true }));
  await registerIssueRoutes(app, config);
  registerRepositoryRoutes(app, config);
  registerStatusDefinitionRoutes(app);
  return app;
}
