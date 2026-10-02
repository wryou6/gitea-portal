import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config/env.js';
import { oauthAuthorizeUrl, exchangeOAuthCode } from '../auth/oauth.js';
import { clearSession, readSession } from '../auth/session.js';
import { consumeOAuthTransaction, clearOAuthTransactionCookie, createOAuthTransaction } from '../auth/oauth-state.js';
import { safePortalReturnTo, withAuthError } from '../auth/oauth-return-to.js';
import { apiErrorResponse } from '../errors.js';
import { GiteaClient } from '../gitea/client.js';
import { GiteaError } from '../gitea/errors.js';
import { setSession } from '../auth/session.js';

export function registerHttpRoutes(app: FastifyInstance, config: AppConfig): void {
  app.get('/auth/login', async (request, reply) => {
    const returnTo = (request.query as { returnTo?: unknown }).returnTo;
    const target = safePortalReturnTo(returnTo, config.webOrigin);
    const state = createOAuthTransaction(reply, config, target);
    return reply.redirect(oauthAuthorizeUrl(config, state));
  });
  app.get('/auth/callback', async (request, reply) => {
    const query = request.query as {
      code?: unknown;
      state?: unknown;
      error?: unknown;
    };
    const state = typeof query.state === "string" ? query.state : undefined;
    const code = typeof query.code === "string" ? query.code : undefined;
    const oauthError = typeof query.error === "string" ? query.error : undefined;
    const transaction = consumeOAuthTransaction(request, config, state);
    if (!transaction) {
      clearOAuthTransactionCookie(reply, config);
      const failure = new URL(withAuthError('/', 'failed'), config.webOrigin);
      return reply.redirect(failure.toString());
    }
    const returnTo = safePortalReturnTo(transaction.returnTo, config.webOrigin);
    if (oauthError) {
      clearOAuthTransactionCookie(reply, config);
      const error =
        oauthError === "access_denied" ? "denied" : "failed";
      return reply.redirect(
        new URL(withAuthError(returnTo, error), config.webOrigin).toString(),
      );
    }
    if (!code) {
      clearOAuthTransactionCookie(reply, config);
      const failure = new URL(withAuthError(returnTo, 'failed'), config.webOrigin);
      return reply.redirect(failure.toString());
    }
    try { await exchangeOAuthCode(config, code, reply); } catch (error) {
      request.log.error({ err: error }, 'OAuth callback failed');
      clearOAuthTransactionCookie(reply, config);
      const failure = new URL(withAuthError(returnTo, 'failed'), config.webOrigin);
      return reply.redirect(failure.toString());
    }
    clearOAuthTransactionCookie(reply, config);
    return reply.redirect(new URL(returnTo, config.webOrigin).toString());
  });
  app.post('/auth/logout', async (_request, reply) => { clearSession(reply); return reply.code(204).send(); });
  app.get('/api/session', async (request, reply) => {
    const session = readSession(request, config);
    if (!session) return reply.code(401).send(apiErrorResponse('auth.required', 'Authentication required'));
    const client = new GiteaClient(config.giteaBaseUrl, session.accessToken, config.giteaTimeoutMs, (details, message) => request.log.info(details, message), request.id);
    try {
      const user = await client.currentUser();
      if (user.login !== session.login) {
        clearSession(reply);
        return reply.code(401).send(apiErrorResponse('auth.required', 'Authentication required'));
      }
      const fullName = user.fullName?.trim() || undefined;
      setSession(reply, { ...session, fullName, avatarUrl: user.avatarUrl }, config);
      return { login: session.login, displayName: fullName ?? session.login, avatarUrl: user.avatarUrl };
    } catch (error) {
      if (error instanceof GiteaError && error.status === 401) throw error;
      request.log.info({ statusCode: error instanceof GiteaError ? error.status : undefined }, 'Gitea profile refresh failed; using session profile');
      return { login: session.login, displayName: session.fullName?.trim() || session.login, avatarUrl: session.avatarUrl };
    }
  });
}
