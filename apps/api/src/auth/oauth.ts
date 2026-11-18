import type { AppConfig } from "../config/env.js";
import type { FastifyReply } from "fastify";
import { setSession } from "./session.js";
import { GiteaClient } from "../gitea/client.js";

export function oauthAuthorizeUrl(config: AppConfig, state: string): string {
  const url = new URL(`${config.giteaBaseUrl}/login/oauth/authorize`);
  url.searchParams.set("client_id", config.oauthClientId);
  url.searchParams.set("redirect_uri", config.oauthRedirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.oauthScope);
  url.searchParams.set("state", state);
  return url.toString();
}

type OAuthTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
};

export class OAuthRefreshError extends Error {
  constructor(public readonly statusCode: number) {
    super(`OAuth token refresh failed (${statusCode})`);
    this.name = "OAuthRefreshError";
  }
}

function parseTokenResponse(value: string): OAuthTokenResponse {
  let token: Partial<OAuthTokenResponse>;
  try {
    token = JSON.parse(value) as Partial<OAuthTokenResponse>;
  } catch {
    throw new Error("OAuth token endpoint returned invalid JSON");
  }
  if (typeof token.access_token !== "string" || !token.access_token)
    throw new Error("OAuth token endpoint did not return an access token");
  if (token.refresh_token !== undefined && typeof token.refresh_token !== "string")
    throw new Error("OAuth token endpoint returned an invalid refresh token");
  const expiresIn = token.expires_in;
  if (typeof expiresIn !== "number" || !Number.isFinite(expiresIn) || expiresIn <= 0)
    throw new Error("OAuth token endpoint returned an invalid expiry");
  return {
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_in: expiresIn,
  };
}

export async function exchangeOAuthCode(
  config: AppConfig,
  code: string,
  reply: FastifyReply,
): Promise<void> {
  const body = new URLSearchParams({
    client_id: config.oauthClientId,
    client_secret: config.oauthClientSecret,
    code,
    redirect_uri: config.oauthRedirectUri,
    grant_type: "authorization_code",
  });
  const response = await fetch(`${config.giteaBaseUrl}/login/oauth/access_token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const responseBody = await response.text();
  if (!response.ok)
    throw new Error(
      `OAuth token exchange failed (${response.status}): ${responseBody.slice(0, 240)}`,
    );
  const token = parseTokenResponse(responseBody);
  if (!token.refresh_token)
    throw new Error("OAuth token endpoint did not return a refresh token");
  const user = await new GiteaClient(
    config.giteaBaseUrl,
    token.access_token,
    config.giteaTimeoutMs,
  ).currentUser();
  const now = Date.now();
  setSession(
    reply,
    {
      version: 2,
      login: user.login,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      accessTokenExpiresAt: now + token.expires_in * 1000,
      issuedAt: now,
      lastActivityAt: now,
      absoluteExpiresAt: now + config.sessionAbsoluteTimeoutMs,
    },
    config,
  );
}

export async function refreshOAuthToken(
  config: AppConfig,
  refreshToken: string,
): Promise<OAuthTokenResponse> {
  const body = new URLSearchParams({
    client_id: config.oauthClientId,
    client_secret: config.oauthClientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const response = await fetch(`${config.giteaBaseUrl}/login/oauth/access_token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    signal: AbortSignal.timeout(config.giteaTimeoutMs),
  });
  const responseBody = await response.text();
  if (!response.ok) throw new OAuthRefreshError(response.status);
  return parseTokenResponse(responseBody);
}
