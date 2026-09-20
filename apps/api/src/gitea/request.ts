import type { FastifyRequest } from 'fastify';
import { GiteaClient } from './client.js';

export function giteaFor(request: FastifyRequest, baseUrl: string): GiteaClient {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  return new GiteaClient(baseUrl, token);
}
