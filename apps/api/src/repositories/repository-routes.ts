import type { FastifyInstance } from "fastify";
import type { AppConfig } from "../config/env.js";
import { giteaFor } from "../gitea/request.js";
import {
  getRepositoryGantt,
  getRepositoryKanban,
  getRepositoryWorkspace,
} from "./repository-workspace-service.js";
import { canAccessRepository } from "../auth/permissions.js";
import { PortalError } from "../errors.js";

export function registerRepositoryRoutes(
  app: FastifyInstance,
  config: AppConfig,
): void {
  app.get("/api/repositories/:owner/:repo/kanban", async (request) => {
    const params = request.params as { owner: string; repo: string };
    const client = giteaFor(request, config.giteaBaseUrl, config);
    const repository = await getRepositoryWorkspace(client, {
      owner: params.owner,
      name: params.repo,
    });
    return getRepositoryKanban(client, repository);
  });

  app.get("/api/repositories/:owner/:repo/assignees", async (request) => {
    const params = request.params as { owner: string; repo: string };
    const client = giteaFor(request, config.giteaBaseUrl, config);
    const repository = { owner: params.owner, name: params.repo };
    if (!(await canAccessRepository(client, repository, "read")))
      throw new PortalError(403, "目前使用者沒有讀取此 Repository 的權限");
    return (await client.assignees(repository)).map(({ login, fullName }) => ({
      login,
      fullName,
    }));
  });

  app.get("/api/repositories/:owner/:repo/gantt", async (request) => {
    const params = request.params as { owner: string; repo: string };
    const client = giteaFor(request, config.giteaBaseUrl, config);
    const repository = await getRepositoryWorkspace(client, {
      owner: params.owner,
      name: params.repo,
    });
    return getRepositoryGantt(client, repository);
  });
}
