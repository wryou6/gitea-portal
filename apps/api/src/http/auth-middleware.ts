import { createHash } from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { AppConfig } from "../config/env.js";
import { OAuthRefreshError, refreshOAuthToken } from "../auth/oauth.js";
import { clearSession, encodeSession, readSession, setSession } from "../auth/session.js";
import { apiErrorResponse } from "../errors.js";

const REFRESH_WINDOW_MS = 2 * 60 * 1000;
const refreshes = new Map<
  string,
  Promise<Awaited<ReturnType<typeof refreshOAuthToken>>>
>();

async function refreshOnce(config: AppConfig, refreshToken: string) {
  const key = createHash("sha256").update(refreshToken).digest("hex");
  const existing = refreshes.get(key);
  if (existing) return existing;
  const pending = refreshOAuthToken(config, refreshToken);
  refreshes.set(key, pending);
  try {
    return await pending;
  } finally {
    if (refreshes.get(key) === pending) refreshes.delete(key);
  }
}

export function registerAuthMiddleware(
  app: FastifyInstance,
  config: AppConfig,
): void {
  app.addHook("preHandler", async (request, reply) => {
    if (!request.url.startsWith("/api/")) return;
    const session = readSession(request, config);
    if (
      ["POST", "PATCH", "PUT", "DELETE"].includes(request.method) &&
      session &&
      !request.headers.authorization
    ) {
      const csrfCookie = request.headers.cookie?.match(
        /(?:^|;\s*)portal_csrf=([^;]+)/,
      )?.[1];
      if (!csrfCookie || csrfCookie !== request.headers["x-csrf-token"])
        return reply
          .code(403)
          .send(apiErrorResponse("auth.csrf_failed", "CSRF validation failed"));
    }
    if (request.headers.authorization) return;
    if (!session)
      return reply
        .code(401)
        .send(apiErrorResponse("auth.required", "Authentication required"));

    let current = session;
    if (session.accessTokenExpiresAt <= Date.now() + REFRESH_WINDOW_MS) {
      if (!session.refreshToken) {
        clearSession(reply, config);
        return reply
          .code(401)
          .send(apiErrorResponse("auth.required", "Authentication required"));
      }
      try {
        const token = await refreshOnce(config, session.refreshToken);
        current = {
          ...session,
          accessToken: token.access_token,
          refreshToken: token.refresh_token ?? session.refreshToken,
          accessTokenExpiresAt: Date.now() + token.expires_in * 1000,
        };
      } catch (error) {
        if (error instanceof OAuthRefreshError && [400, 401].includes(error.statusCode)) {
          clearSession(reply, config);
          return reply
            .code(401)
            .send(apiErrorResponse("auth.required", "Authentication required"));
        }
        request.log.warn(
          { errorName: error instanceof Error ? error.name : "unknown" },
          "OAuth token refresh unavailable",
        );
        return reply
          .code(502)
          .send(apiErrorResponse("gitea.unavailable", "Gitea unavailable"));
      }
    }

    current = { ...current, lastActivityAt: Date.now() };
    setSession(reply, current, config);
    const cookie = request.headers.cookie ?? "";
    const cookieValue = `portal_session=${encodeSession(current, config.sessionSecret)}`;
    request.headers.cookie = /(?:^|;\s*)portal_session=[^;]*/.test(cookie)
      ? cookie
          .replace(/(?:^|;\s*)portal_session=[^;]*/, `; ${cookieValue}`)
          .replace(/^;\s*/, "")
      : [cookie, cookieValue].filter(Boolean).join("; ");
  });
}
