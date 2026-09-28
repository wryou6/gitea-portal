import type { FastifyInstance } from "fastify";
import type { AppConfig } from "../config/env.js";
import { readSession } from "../auth/session.js";
import { apiErrorResponse } from "../errors.js";
import { giteaFor } from "../gitea/request.js";
import { migrateAllStatusLabels } from "../issues/status-label-migration-service.js";

export function registerStatusLabelMigrationRoutes(
  app: FastifyInstance,
  config: AppConfig,
): void {
  app.post("/api/admin/status-label-migration", async (request, reply) => {
    const session = readSession(request, config);
    if (session?.login !== "admin") {
      return reply
        .code(403)
        .send(apiErrorResponse("permission.denied", "Only the admin account can migrate Issue Status labels"));
    }

    const client = giteaFor(request, config.giteaBaseUrl, config);
    return migrateAllStatusLabels(client);
  });
}
