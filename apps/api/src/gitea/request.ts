import type { FastifyRequest } from 'fastify';
import { GiteaClient } from './client.js';
import { readSession } from '../auth/session.js';
import type { AppConfig } from '../config/env.js';

export function giteaFor(request: FastifyRequest, baseUrl: string, config?: AppConfig): GiteaClient {
  const token = request.headers.authorization?.replace(/^(?:Bearer|token)\s+/i, '') ?? (config ? readSession(request, config)?.accessToken : undefined);
  return new GiteaClient(baseUrl, token, config?.giteaTimeoutMs, (details, message) => request.log.info(details, message), request.id);
}
