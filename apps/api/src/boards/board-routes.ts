import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config/env.js';
import { BoardRepository, type BoardInput } from '../persistence/board-repository.js';

export function registerBoardRoutes(app: FastifyInstance, config: AppConfig, boards: BoardRepository): void {
  void config;
  app.get('/api/boards', async () => boards.list());
  app.post('/api/boards', async (request, reply) => reply.code(201).send(boards.create(request.body as BoardInput)));
  app.get('/api/boards/:id', async (request, reply) => {
    const board = boards.get((request.params as { id: string }).id);
    if (!board) return reply.code(404).send({ error: 'Board not found' });
    return board;
  });
  app.patch('/api/boards/:id', async (request, reply) => {
    const board = boards.update((request.params as { id: string }).id, request.body as BoardInput);
    if (!board) return reply.code(404).send({ error: 'Board not found' });
    return board;
  });
  app.delete('/api/boards/:id', async (request, reply) => {
    boards.delete((request.params as { id: string }).id);
    return reply.code(204).send();
  });
}
