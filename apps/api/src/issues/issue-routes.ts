import type { FastifyInstance } from "fastify";
import type { AppConfig } from "../config/env.js";
import { giteaFor } from "../gitea/request.js";
import { getIssue } from "./issue-service.js";
import { isIssueSortField, searchIssuesReadThrough } from "./issue-search-service.js";
import { getIssueComments } from "./comment-query-service.js";
import { addIssueComment } from "./comment-command-service.js";
import { listRepositories } from "../repositories/repository-service.js";
import { canAccessRepository } from "../auth/permissions.js";
import { createIssue, updateIssue } from "./issue-command-service.js";
import { validateComment } from "./issue-validation.js";
import { transitionIssue } from "./status-transition-service.js";
import { apiErrorResponse } from "../errors.js";
import { PortalError } from "../errors.js";

export async function registerIssueRoutes(
  app: FastifyInstance,
  config: AppConfig,
): Promise<void> {
  app.get("/api/repositories", async (request) =>
    listRepositories(giteaFor(request, config.giteaBaseUrl, config)),
  );
  app.get("/api/issues", async (request) => {
    const query = request.query as Record<string, string | undefined>;
    const sort = query.sort ?? "key";
    const direction = query.direction ?? "asc";
    if (!isIssueSortField(sort)) throw new PortalError(422, "Invalid issue sort field");
    if (direction !== "asc" && direction !== "desc") throw new PortalError(422, "Invalid sort direction");
    return searchIssuesReadThrough(
      giteaFor(request, config.giteaBaseUrl, config),
      {
        q: query.q,
        repository: query.repository,
        state:
          query.state === "todo" || query.state === "in-progress"
            ? "open"
            : query.state === "done"
              ? "closed"
              : (query.state as "open" | "closed" | "all" | undefined),
        portalStatus: query.state === "todo" || query.state === "in-progress" || query.state === "done"
          ? query.state
          : undefined,
        assignee: query.assignee,
        priority: ["critical", "high", "medium", "low"].includes(query.priority ?? "")
          ? query.priority as "critical" | "high" | "medium" | "low"
          : undefined,
        issueType: ["bug", "feature", "task"].includes(query.issueType ?? "")
          ? query.issueType as "bug" | "feature" | "task"
          : undefined,
        milestone: query.milestone,
        labels: [
          ...(query.label?.split(",").filter(Boolean) ?? []),
        ],
        page: Number(query.page ?? 1),
        limit: Number(query.limit ?? 50),
        sort,
        direction,
      },
    );
  });
  app.get("/api/issues/:owner/:repo/:number", async (request) => {
    const params = request.params as {
      owner: string;
      repo: string;
      number: string;
    };
    return getIssue(
      giteaFor(request, config.giteaBaseUrl, config),
      { owner: params.owner, name: params.repo },
      Number(params.number),
    );
  });
  app.post("/api/repositories/:owner/:repo/issues", async (request, reply) => {
    const params = request.params as { owner: string; repo: string };
    const client = giteaFor(request, config.giteaBaseUrl, config);
    const repository = { owner: params.owner, name: params.repo };
    if (!(await canAccessRepository(client, repository, "create")))
      return reply.code(403).send(apiErrorResponse("permission.denied", "Permission denied"));
    const issue = await createIssue(client, repository, request.body);
    return reply.code(201).send(issue);
  });
  app.patch("/api/issues/:owner/:repo/:number", async (request, reply) => {
    const params = request.params as {
      owner: string;
      repo: string;
      number: string;
    };
    const client = giteaFor(request, config.giteaBaseUrl, config);
    const repository = { owner: params.owner, name: params.repo };
    if (!(await canAccessRepository(client, repository, "update")))
      return reply.code(403).send(apiErrorResponse("permission.denied", "Permission denied"));
    return updateIssue(client, repository, Number(params.number), request.body);
  });
  app.post(
    "/api/issues/:owner/:repo/:number/transition",
    async (request, reply) => {
      const params = request.params as {
        owner: string;
        repo: string;
        number: string;
      };
      const client = giteaFor(request, config.giteaBaseUrl, config);
      return reply.send(
        await transitionIssue(
          client,
          { owner: params.owner, name: params.repo },
          Number(params.number),
          request.body as {
            actionKey?: string;
            selectedAssignee?: string;
            expectedUpdatedAt?: string;
          },
        ),
      );
    },
  );
  app.get("/api/issues/:owner/:repo/:number/comments", async (request) => {
    const params = request.params as {
      owner: string;
      repo: string;
      number: string;
    };
    return getIssueComments(
      giteaFor(request, config.giteaBaseUrl, config),
      { owner: params.owner, name: params.repo },
      Number(params.number),
    );
  });
  app.post(
    "/api/issues/:owner/:repo/:number/comments",
    async (request, reply) => {
      const params = request.params as {
        owner: string;
        repo: string;
        number: string;
      };
      let body: string;
      try {
        body = validateComment((request.body as { body?: unknown }).body);
      } catch (error) {
        return reply.code(422).send(apiErrorResponse("validation.invalid_request", error instanceof Error ? error.message : "Comment body is required"));
      }
      const client = giteaFor(request, config.giteaBaseUrl, config);
      const repository = { owner: params.owner, name: params.repo };
      if (!(await canAccessRepository(client, repository, "comment")))
        return reply.code(403).send(apiErrorResponse("permission.denied", "Permission denied"));
      const comment = await addIssueComment(
        client,
        repository,
        Number(params.number),
        body,
      );
      return reply.code(201).send(comment);
    },
  );
}
