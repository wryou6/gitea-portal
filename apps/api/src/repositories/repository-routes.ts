import type { FastifyInstance } from "fastify";
import type { AppConfig } from "../config/env.js";
import type { WorkflowConvention } from "@gitea-portal/domain";
import { giteaFor } from "../gitea/request.js";
import { mapIssue } from "../issues/issue-service.js";
import { PortalError } from "../errors.js";
import { transitionRepositoryCard } from "../boards/transition-service.js";
import {
  getRepositoryGantt,
  getRepositoryKanban,
  getRepositoryWorkspace,
  requireRepositoryConvention,
} from "./repository-workspace-service.js";

export function registerRepositoryRoutes(
  app: FastifyInstance,
  config: AppConfig,
  conventions: WorkflowConvention[],
): void {
  app.get("/api/repositories/:owner/:repo/kanban", async (request) => {
    const params = request.params as { owner: string; repo: string };
    const client = giteaFor(request, config.giteaBaseUrl, config);
    const repository = await getRepositoryWorkspace(
      client,
      { owner: params.owner, name: params.repo },
      conventions,
    );
    const convention = requireRepositoryConvention(repository, conventions);
    return getRepositoryKanban(client, repository, convention);
  });

  app.get("/api/repositories/:owner/:repo/gantt", async (request) => {
    const params = request.params as { owner: string; repo: string };
    const client = giteaFor(request, config.giteaBaseUrl, config);
    const repository = await getRepositoryWorkspace(
      client,
      { owner: params.owner, name: params.repo },
      conventions,
    );
    requireRepositoryConvention(repository, conventions);
    return getRepositoryGantt(client, repository);
  });

  app.post(
    "/api/repositories/:owner/:repo/issues/:number/transition",
    async (request) => {
      const params = request.params as {
        owner: string;
        repo: string;
        number: string;
      };
      const body = request.body as { stateKey?: string };
      if (!body.stateKey) throw new PortalError(422, "stateKey is required");
      const client = giteaFor(request, config.giteaBaseUrl, config);
      const repositoryRef = { owner: params.owner, name: params.repo };
      const repository = await getRepositoryWorkspace(
        client,
        repositoryRef,
        conventions,
      );
      const convention = requireRepositoryConvention(repository, conventions);
      const issue = await transitionRepositoryCard(
        client,
        convention,
        repositoryRef,
        Number(params.number),
        body.stateKey,
      );
      return mapIssue(issue);
    },
  );
}
