import type { FastifyInstance } from 'fastify';
import { GiteaError } from '../gitea/errors.js';
import { apiErrorResponse, errorCodeForStatus, PortalError } from '../errors.js';
import { clearSession } from '../auth/session.js';

export function registerErrorHandler(app: FastifyInstance): void {
  app.setNotFoundHandler((_request, reply) =>
    reply
      .code(404)
      .send(apiErrorResponse('resource.not_found', 'Not found')),
  );

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof PortalError) return reply.code(error.status).send(apiErrorResponse(error.code, error.message, undefined, error.params));
    if (error instanceof GiteaError) {
      const status = error.status === 401 || error.status === 403 || error.status === 404 || error.status === 409 ? error.status : 502;
      const portalStatus = status === 401 ? 401 : status === 403 ? 403 : status === 404 ? 404 : status === 409 ? 409 : 502;
      const code = status === 401 ? 'auth.required' : errorCodeForStatus(portalStatus);
      if (status === 401) clearSession(reply);
      return reply.code(status).send(apiErrorResponse(code, status === 403 ? 'Permission denied' : status === 404 ? 'Not found' : status === 409 ? 'Conflict' : status === 401 ? 'Authentication required' : 'Gitea unavailable', error.message));
    }
    if (typeof error === 'object' && error !== null && 'statusCode' in error && (error as { statusCode?: unknown }).statusCode === 400) {
      return reply.code(422).send(apiErrorResponse('validation.invalid_request', error instanceof Error ? error.message : 'Invalid request'));
    }
    if (error instanceof Error && /required|invalid|compatible|unavailable|Duplicate/.test(error.message)) return reply.code(422).send(apiErrorResponse('validation.invalid_request', error.message));
    app.log.error(error);
    return reply.code(500).send(apiErrorResponse('server.internal_error', 'Internal server error'));
  });
}
