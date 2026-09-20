import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config/env.js';
import { giteaFor } from '../gitea/request.js';
import { getIssue } from './issue-service.js';
import { searchIssuesReadThrough } from './issue-search-service.js';
import { getIssueComments } from './comment-query-service.js';
import { addIssueComment } from './comment-command-service.js';
import { listRepositories } from '../repositories/repository-service.js';
import { loadConventions } from '../workflows/convention-loader.js';
import { canAccessRepository } from '../auth/permissions.js';
import { createIssue, updateIssue } from './issue-command-service.js';
import { validateComment } from './issue-validation.js';

export async function registerIssueRoutes(app: FastifyInstance, config: AppConfig): Promise<void> {
  const conventions = await loadConventions(config.workflowConfigPath);
  app.get('/api/repositories', async (request) => listRepositories(giteaFor(request, config.giteaBaseUrl, config), conventions));
  app.get('/api/issues', async (request) => {
    const query = request.query as Record<string, string | undefined>;
    return searchIssuesReadThrough(giteaFor(request, config.giteaBaseUrl, config), {
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
    return getIssue(giteaFor(request, config.giteaBaseUrl, config), { owner: params.owner, name: params.repo }, Number(params.number));
  });
  app.post('/api/repositories/:owner/:repo/issues', async (request, reply) => {
    const params = request.params as { owner: string; repo: string };
    const client = giteaFor(request, config.giteaBaseUrl, config); const repository = { owner: params.owner, name: params.repo };
    if (!await canAccessRepository(client, repository, 'create')) return reply.code(403).send({ error: 'Permission denied' });
    const issue = await createIssue(client, repository, request.body);
    return reply.code(201).send(issue);
  });
  app.patch('/api/issues/:owner/:repo/:number', async (request) => {
    const params = request.params as { owner: string; repo: string; number: string };
    const client = giteaFor(request, config.giteaBaseUrl, config); const repository = { owner: params.owner, name: params.repo };
    if (!await canAccessRepository(client, repository, 'update')) throw new Error('Permission denied');
    return updateIssue(client, repository, Number(params.number), request.body);
  });
  app.get('/api/issues/:owner/:repo/:number/comments', async (request) => {
    const params = request.params as { owner: string; repo: string; number: string };
    return getIssueComments(giteaFor(request, config.giteaBaseUrl, config), { owner: params.owner, name: params.repo }, Number(params.number));
  });
  app.post('/api/issues/:owner/:repo/:number/comments', async (request, reply) => {
    const params = request.params as { owner: string; repo: string; number: string };
    let body: string;
    try { body = validateComment((request.body as { body?: unknown }).body); } catch (error) { return reply.code(422).send({ error: error instanceof Error ? error.message : 'Comment body is required' }); }
    const client = giteaFor(request, config.giteaBaseUrl, config); const repository = { owner: params.owner, name: params.repo };
    if (!await canAccessRepository(client, repository, 'comment')) return reply.code(403).send({ error: 'Permission denied' });
    const comment = await addIssueComment(client, repository, Number(params.number), body);
    return reply.code(201).send(comment);
  });
}
