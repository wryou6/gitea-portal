import type { FastifyReply, FastifyRequest } from 'fastify';

export async function requireSession(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (!request.headers.authorization) {
    await reply.code(401).send({ error: 'Authentication required' });
  }
}
