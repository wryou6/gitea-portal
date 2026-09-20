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
  const body = new URLSearchParams({ client_id: config.oauthClientId, client_secret: config.oauthClientSecret, code, redirect_uri: config.oauthRedirectUri, grant_type: 'authorization_code' });
  const response = await fetch(`${config.giteaBaseUrl}/login/oauth/access_token`, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  const responseBody = await response.text();
  if (!response.ok) throw new Error(`OAuth token exchange failed (${response.status}): ${responseBody.slice(0, 240)}`);
  let token: { access_token?: string; expires_in?: number };
  try { token = JSON.parse(responseBody) as { access_token?: string; expires_in?: number }; } catch { throw new Error('OAuth token exchange returned invalid JSON'); }
  if (!token.access_token) throw new Error('OAuth token missing');
  const identity = await fetch(`${config.giteaBaseUrl}/api/v1/user`, { headers: { Authorization: `token ${token.access_token}`, Accept: 'application/json' } });
  if (!identity.ok) throw new Error(`OAuth identity lookup failed (${identity.status})`);
  const user = await identity.json() as { login: string };
  setSession(reply, { login: user.login, accessToken: token.access_token, expiresAt: Date.now() + (token.expires_in ?? 28800) * 1000 }, config);
}

export function oauthState(): string { return randomBytes(24).toString('base64url'); }
