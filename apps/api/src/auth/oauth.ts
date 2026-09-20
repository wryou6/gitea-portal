import type { AppConfig } from '../config/env.js';
import { randomBytes } from 'node:crypto';
import type { FastifyReply } from 'fastify';
import { setSession } from './session.js';

export function oauthAuthorizeUrl(config: AppConfig, state: string): string {
  const url = new URL(`${config.giteaBaseUrl}/login/oauth/authorize`);
  url.searchParams.set('client_id', config.oauthClientId);
  url.searchParams.set('redirect_uri', config.oauthRedirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);
  return url.toString();
}

export async function exchangeOAuthCode(config: AppConfig, code: string, reply: FastifyReply): Promise<void> {
  const response = await fetch(`${config.giteaBaseUrl}/login/oauth/access_token`, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ client_id: config.oauthClientId, client_secret: config.oauthClientSecret, code, redirect_uri: config.oauthRedirectUri }) });
  if (!response.ok) throw new Error('OAuth token exchange failed');
  const token = await response.json() as { access_token?: string; expires_in?: number };
  if (!token.access_token) throw new Error('OAuth token missing');
  const identity = await fetch(`${config.giteaBaseUrl}/api/v1/user`, { headers: { Authorization: `token ${token.access_token}`, Accept: 'application/json' } });
  const user = await identity.json() as { login: string };
  setSession(reply, { login: user.login, accessToken: token.access_token, expiresAt: Date.now() + (token.expires_in ?? 28800) * 1000 }, config);
}

export function oauthState(): string { return randomBytes(24).toString('base64url'); }
