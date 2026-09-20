import type { FastifyInstance } from 'fastify';
import { GiteaError } from '../gitea/errors.js';

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof GiteaError) {
      return reply.code(error.status === 401 || error.status === 403 ? error.status : 502).send({ error: 'Gitea request failed', detail: error.message });
    }
    app.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  });
}
