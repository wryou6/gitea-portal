import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AppConfig } from '../config/env.js';
import { readSession } from './session.js';
import { apiErrorResponse } from '../errors.js';

export async function requireSession(request: FastifyRequest, reply: FastifyReply, config?: AppConfig): Promise<void> {
  if (!request.headers.authorization && (!config || !readSession(request, config))) {
    await reply.code(401).send(apiErrorResponse('auth.required', 'Authentication required'));
  }
}
