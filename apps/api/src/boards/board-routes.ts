import type { FastifyInstance } from "fastify";
import type { AppConfig } from "../config/env.js";
import {
  BoardRepository,
  type BoardInput,
} from "../persistence/board-repository.js";
import { giteaFor } from "../gitea/request.js";
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
    return reply.code(201).send(await createBoard(boards, input));
  });
  app.get("/api/boards/:id", async (request, reply) => {
    const board = await boards.get((request.params as { id: string }).id);
    if (!board) return reply.code(404).send({ error: "Board not found" });
    const client = giteaFor(request, config.giteaBaseUrl, config);
    if (!(await repositoriesReadable(client, board.repositoryRefs)))
      return reply.code(403).send({
        error: "Permission denied for one or more Board repositories",
      });
    return getBoardView(client, board);
  });
  app.get("/api/boards/:id/gantt", async (request, reply) => {
    const board = await boards.get((request.params as { id: string }).id);
    if (!board) return reply.code(404).send({ error: "Board not found" });
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
    );
    if (!board) return reply.code(404).send({ error: "Board not found" });
    return board;
  });
  app.delete("/api/boards/:id", async (request, reply) => {
    await boards.delete((request.params as { id: string }).id);
    return reply.send({ deleted: true });
  });
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
