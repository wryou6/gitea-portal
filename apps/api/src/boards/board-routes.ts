import type { FastifyInstance } from "fastify";
import type { AppConfig } from "../config/env.js";
import {
  BoardRepository,
  type BoardInput,
} from "../persistence/board-repository.js";
import { giteaFor } from "../gitea/request.js";
import { transitionCard } from "./transition-service.js";
import type { WorkflowConvention } from "@gitea-portal/domain";
import { createBoard, updateBoard } from "./board-service.js";
import { getBoardView } from "./board-view-service.js";
import { canAccessRepository } from "../auth/permissions.js";
import { PortalError } from "../errors.js";
import { getBoardGanttView } from "./gantt-service.js";
import { getBoardIssues } from "./board-issue-service.js";

export function registerBoardRoutes(
  app: FastifyInstance,
  config: AppConfig,
  boards: BoardRepository,
  conventions: WorkflowConvention[],
): void {
  app.get("/api/boards", async () => boards.list());
  app.post("/api/boards", async (request, reply) => {
    const input = request.body as BoardInput;
    const client = giteaFor(request, config.giteaBaseUrl, config);
    if (!(await repositoriesReadable(client, input.repositoryRefs)))
      throw new PortalError(
        403,
        "Permission denied for one or more Board repositories",
      );
    return reply.code(201).send(await createBoard(boards, input, conventions));
  });
  app.get("/api/boards/:id", async (request, reply) => {
    const board = await boards.get((request.params as { id: string }).id);
    if (!board) return reply.code(404).send({ error: "Board not found" });
    const convention = conventions.find(
      (item) =>
        item.id === board.workflowConventionId &&
        item.version === board.workflowConventionVersion,
    );
    if (!convention)
      return reply
        .code(422)
        .send({ error: "Workflow Convention is unavailable" });
    return getBoardView(
      giteaFor(request, config.giteaBaseUrl, config),
      board,
      convention,
    );
  });
  app.get("/api/boards/:id/gantt", async (request, reply) => {
    const board = await boards.get((request.params as { id: string }).id);
    if (!board) return reply.code(404).send({ error: "Board not found" });
    const convention = conventions.find(
      (item) =>
        item.id === board.workflowConventionId &&
        item.version === board.workflowConventionVersion,
    );
    if (!convention)
      return reply
        .code(422)
        .send({ error: "Workflow Convention is unavailable" });
    const client = giteaFor(request, config.giteaBaseUrl, config);
    if (!(await repositoriesReadable(client, board.repositoryRefs)))
      return reply.code(403).send({
        error: "Permission denied for one or more Board repositories",
      });
    return getBoardGanttView(client, board);
  });
  app.get("/api/boards/:id/issues", async (request, reply) => {
    const board = await boards.get((request.params as { id: string }).id);
    if (!board) return reply.code(404).send({ error: "Board not found" });
    const client = giteaFor(request, config.giteaBaseUrl, config);
    if (!(await repositoriesReadable(client, board.repositoryRefs))) {
      return reply.code(403).send({
        error: "Permission denied for one or more Board repositories",
      });
    }
    const query = request.query as Record<string, string | undefined>;
    return getBoardIssues(client, board, {
      q: query.q,
      state: query.state as "open" | "closed" | "all" | undefined,
      assignee: query.assignee,
      label: query.label,
      milestone: query.milestone,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 50),
    });
  });
  app.patch("/api/boards/:id", async (request, reply) => {
    const input = request.body as BoardInput;
    const client = giteaFor(request, config.giteaBaseUrl, config);
    if (!(await repositoriesReadable(client, input.repositoryRefs)))
      throw new PortalError(
        403,
        "Permission denied for one or more Board repositories",
      );
    const board = await updateBoard(
      boards,
      (request.params as { id: string }).id,
      input,
      conventions,
    );
    if (!board) return reply.code(404).send({ error: "Board not found" });
    return board;
  });
  app.delete("/api/boards/:id", async (request, reply) => {
    await boards.delete((request.params as { id: string }).id);
    return reply.send({ deleted: true });
  });
  app.post(
    "/api/boards/:id/cards/:owner/:repo/:number/transition",
    async (request, reply) => {
      const params = request.params as {
        id: string;
        owner: string;
        repo: string;
        number: string;
      };
      const board = await boards.get(params.id);
      if (!board) return reply.code(404).send({ error: "Board not found" });
      const convention = conventions.find(
        (item) =>
          item.id === board.workflowConventionId &&
          item.version === board.workflowConventionVersion,
      );
      if (!convention)
        return reply
          .code(422)
          .send({ error: "Workflow Convention is unavailable" });
      const body = request.body as { stateKey?: string };
      if (!body.stateKey)
        return reply.code(422).send({ error: "stateKey is required" });
      return transitionCard(
        giteaFor(request, config.giteaBaseUrl, config),
        board,
        convention,
        { owner: params.owner, name: params.repo },
        Number(params.number),
        body.stateKey,
      );
    },
  );
}

async function repositoriesReadable(
  client: ReturnType<typeof giteaFor>,
  repositories: BoardInput["repositoryRefs"],
): Promise<boolean> {
  const permissions = await Promise.all(
    repositories.map((repository) =>
      canAccessRepository(client, repository, "read"),
    ),
  );
  return permissions.every(Boolean);
}
