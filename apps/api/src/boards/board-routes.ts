import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config/env.js';
import { BoardRepository, type BoardInput } from '../persistence/board-repository.js';
import { giteaFor } from '../gitea/request.js';
import { transitionCard } from './transition-service.js';
import type { WorkflowConvention } from '@gitea-portal/domain';
import { createBoard, updateBoard } from './board-service.js';
import { getBoardView } from './board-view-service.js';

export function registerBoardRoutes(app: FastifyInstance, config: AppConfig, boards: BoardRepository, conventions: WorkflowConvention[]): void {
  app.get('/api/boards', async () => boards.list());
  app.post('/api/boards', async (request, reply) => reply.code(201).send(await createBoard(boards, request.body as BoardInput, conventions)));
  app.get('/api/boards/:id', async (request, reply) => {
    const board = await boards.get((request.params as { id: string }).id);
    if (!board) return reply.code(404).send({ error: 'Board not found' });
    const convention = conventions.find((item) => item.id === board.workflowConventionId && item.version === board.workflowConventionVersion);
    if (!convention) return reply.code(422).send({ error: 'Workflow Convention is unavailable' });
    return getBoardView(giteaFor(request, config.giteaBaseUrl, config), board, convention);
  });
  app.patch('/api/boards/:id', async (request, reply) => {
    const board = await updateBoard(boards, (request.params as { id: string }).id, request.body as BoardInput, conventions);
    if (!board) return reply.code(404).send({ error: 'Board not found' });
    return board;
  });
  app.delete('/api/boards/:id', async (request, reply) => {
    await boards.delete((request.params as { id: string }).id);
    return reply.code(204).send();
  });
  app.post('/api/boards/:id/cards/:owner/:repo/:number/transition', async (request, reply) => {
    const params = request.params as { id: string; owner: string; repo: string; number: string };
    const board = await boards.get(params.id);
    if (!board) return reply.code(404).send({ error: 'Board not found' });
    const convention = conventions.find((item) => item.id === board.workflowConventionId && item.version === board.workflowConventionVersion);
    if (!convention) return reply.code(422).send({ error: 'Workflow Convention is unavailable' });
    try {
      const body = request.body as { stateKey?: string };
      if (!body.stateKey) return reply.code(422).send({ error: 'stateKey is required' });
      return await transitionCard(giteaFor(request, config.giteaBaseUrl, config), board, convention, { owner: params.owner, name: params.repo }, Number(params.number), body.stateKey);
    } catch (error) {
      return reply.code(422).send({ error: error instanceof Error ? error.message : 'Atomic transition rejected' });
    }
  });
}
