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

function queryValues(value: unknown): string[] {
  if (typeof value === "string") return [value];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function queryString(value: unknown): string | undefined {
  return queryValues(value)[0];
}

const portalStatuses = new Set(["todo", "in-progress", "done"]);
const priorities = new Set(["critical", "high", "medium", "low"]);
const issueTypes = new Set(["bug", "feature", "task"]);

export async function registerIssueRoutes(
  app: FastifyInstance,
  config: AppConfig,
): Promise<void> {
  app.get("/api/repositories", async (request) =>
    listRepositories(giteaFor(request, config.giteaBaseUrl, config)),
  );
  app.get("/api/issues", async (request) => {
    const query = request.query as Record<string, unknown>;
    const sort = queryString(query.sort) ?? "key";
    const direction = queryString(query.direction) ?? "asc";
    if (!isIssueSortField(sort)) throw new PortalError(422, "Invalid issue sort field");
    if (direction !== "asc" && direction !== "desc") throw new PortalError(422, "Invalid sort direction");
    const stateValues = queryValues(query.state);
    const selectedStatuses = [...new Set(stateValues.filter((value) => portalStatuses.has(value)))];
    const legacyState = stateValues.find((value) => value === "open" || value === "closed" || value === "all");
    return searchIssuesReadThrough(
      giteaFor(request, config.giteaBaseUrl, config),
      {
        q: queryString(query.q),
        repository: queryString(query.repository),
        state: selectedStatuses.length > 0 ? "all" : legacyState as "open" | "closed" | "all" | undefined,
        portalStatuses: selectedStatuses as ("todo" | "in-progress" | "done")[],
        assignee: queryString(query.assignee),
        priority: [...new Set(queryValues(query.priority).filter((value) => priorities.has(value)))] as ("critical" | "high" | "medium" | "low")[],
        issueType: [...new Set(queryValues(query.issueType).filter((value) => issueTypes.has(value)))] as ("bug" | "feature" | "task")[],
        milestone: queryString(query.milestone),
        labels: [
          ...(queryString(query.label)?.split(",").filter(Boolean) ?? []),
        ],
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
