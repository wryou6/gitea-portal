import type { FastifyInstance } from 'fastify';
import { GiteaError } from '../gitea/errors.js';
import { PortalError } from '../errors.js';

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof PortalError) return reply.code(error.status).send({ error: error.message });
    if (error instanceof GiteaError) {
      const status = error.status === 401 || error.status === 403 || error.status === 404 || error.status === 409 ? error.status : 502;
      return reply.code(status).send({ error: status === 403 ? 'Permission denied' : status === 404 ? 'Not found' : status === 409 ? 'Conflict' : 'Gitea unavailable', detail: error.message });
    }
    if (typeof error === 'object' && error !== null && 'statusCode' in error && (error as { statusCode?: unknown }).statusCode === 400) {
      return reply.code(422).send({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
    if (error instanceof Error && /required|invalid|compatible|unavailable|Duplicate/.test(error.message)) return reply.code(422).send({ error: error.message });
    app.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  });
}
