import type { FastifyInstance } from "fastify";
import type { AppConfig } from "../config/env.js";
import type {
  AllRepositoriesGanttView,
  AllRepositoriesKanbanView,
} from "@gitea-portal/gitea-contracts";
import { giteaFor } from "../gitea/request.js";
import {
  getRepositoryGantt,
  getRepositoryKanban,
  getRepositoryWorkspace,
} from "./repository-workspace-service.js";
import { canAccessRepository } from "../auth/permissions.js";
import { PortalError } from "../errors.js";
import { getWorkflowColumns } from "../work-views/kanban-service.js";
import { mapIssue } from "../issues/issue-service.js";

export function registerRepositoryRoutes(
  app: FastifyInstance,
  config: AppConfig,
): void {
  app.get("/api/repositories/kanban", async (request) => {
    const client = giteaFor(request, config.giteaBaseUrl, config);
    const repositories = await client.repositories();
    const columns = await getWorkflowColumns(client, repositories);
    return { repositories, columns } satisfies AllRepositoriesKanbanView;
  });

  app.get("/api/repositories/gantt", async (request) => {
    const client = giteaFor(request, config.giteaBaseUrl, config);
    const repositories = await client.repositories();
    const groups = await Promise.all(repositories.map((repository) =>
      client.repositoryIssuesAllPages(repository, { state: "all", type: "issues" }),
    ));
    const issues = groups.flatMap((group) => group.map(mapIssue)).sort((left, right) =>
      Date.parse(right.updatedAt) - Date.parse(left.updatedAt) ||
      left.owner.localeCompare(right.owner) || left.name.localeCompare(right.name) || left.number - right.number,
    );
    return { repositories, issues } satisfies AllRepositoriesGanttView;
  });

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
