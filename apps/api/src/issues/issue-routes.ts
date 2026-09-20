import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config/env.js';
import { giteaFor } from '../gitea/request.js';
import { getIssue, searchIssues } from './issue-service.js';
import { createIssue, updateIssue } from './issue-command-service.js';
import { validateComment } from './issue-validation.js';

export async function registerIssueRoutes(app: FastifyInstance, config: AppConfig): Promise<void> {
  app.get('/api/repositories', async (request) => giteaFor(request, config.giteaBaseUrl).repositories());
  app.get('/api/issues', async (request) => {
    const query = request.query as Record<string, string | undefined>;
    return searchIssues(giteaFor(request, config.giteaBaseUrl), {
      q: query.q,
      repository: query.repository,
      state: query.state as 'open' | 'closed' | 'all' | undefined,
      assignee: query.assignee,
      milestone: query.milestone,
      labels: query.label?.split(',').filter(Boolean),
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 50),
    });
  });
  app.get('/api/issues/:owner/:repo/:number', async (request) => {
    const params = request.params as { owner: string; repo: string; number: string };
    return getIssue(giteaFor(request, config.giteaBaseUrl), { owner: params.owner, name: params.repo }, Number(params.number));
  });
  app.post('/api/repositories/:owner/:repo/issues', async (request, reply) => {
    const params = request.params as { owner: string; repo: string };
    const issue = await createIssue(giteaFor(request, config.giteaBaseUrl), { owner: params.owner, name: params.repo }, request.body);
    return reply.code(201).send(issue);
  });
  app.patch('/api/issues/:owner/:repo/:number', async (request) => {
    const params = request.params as { owner: string; repo: string; number: string };
    return updateIssue(giteaFor(request, config.giteaBaseUrl), { owner: params.owner, name: params.repo }, Number(params.number), request.body);
  });
  app.get('/api/issues/:owner/:repo/:number/comments', async (request) => {
    const params = request.params as { owner: string; repo: string; number: string };
    return giteaFor(request, config.giteaBaseUrl).comments({ owner: params.owner, name: params.repo }, Number(params.number));
  });
  app.post('/api/issues/:owner/:repo/:number/comments', async (request, reply) => {
    const params = request.params as { owner: string; repo: string; number: string };
    let body: string;
    try { body = validateComment((request.body as { body?: unknown }).body); } catch (error) { return reply.code(422).send({ error: error instanceof Error ? error.message : 'Comment body is required' }); }
    const comment = await giteaFor(request, config.giteaBaseUrl).createComment({ owner: params.owner, name: params.repo }, Number(params.number), body);
    return reply.code(201).send(comment);
  });
}
