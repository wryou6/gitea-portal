import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AppConfig } from '../config/env.js';

export type PortalSession = { login: string; accessToken: string; expiresAt: number; csrfToken?: string };
const COOKIE = 'portal_session';

function sign(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

export function encodeSession(session: PortalSession, secret: string): string {
  const value = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${value}.${sign(value, secret)}`;
}

export function decodeSession(value: string | undefined, secret: string): PortalSession | undefined {
  if (!value) return undefined;
  const [encoded, signature] = value.split('.');
  if (!encoded || !signature) return undefined;
  const expected = sign(encoded, secret);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return undefined;
  try {
    const session = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as PortalSession;
    return session.expiresAt > Date.now() ? session : undefined;
  } catch { return undefined; }
}

export function readSession(request: FastifyRequest, config: AppConfig): PortalSession | undefined {
  const cookie = request.headers.cookie?.match(/(?:^|;\s*)portal_session=([^;]+)/)?.[1];
  return decodeSession(cookie, config.sessionSecret);
}

export function setSession(reply: FastifyReply, session: PortalSession, config: AppConfig): void {
  const csrfToken = session.csrfToken ?? randomBytes(24).toString('base64url');
  reply.header('Set-Cookie', [`${COOKIE}=${encodeSession({ ...session, csrfToken }, config.sessionSecret)}; HttpOnly; SameSite=Lax; Path=/`, `portal_csrf=${csrfToken}; SameSite=Lax; Path=/`]);
}

export function clearSession(reply: FastifyReply): void { reply.header('Set-Cookie', `${COOKIE}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`); }
export function sessionState(): PortalSession { return { login: '', accessToken: randomBytes(32).toString('hex'), expiresAt: Date.now() + 8 * 60 * 60 * 1000 }; }
