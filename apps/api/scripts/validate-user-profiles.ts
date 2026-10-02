import assert from "node:assert/strict";
import { buildApp } from "../src/app.js";
import type { AppConfig } from "../src/config/env.js";
import { decodeSession, encodeSession } from "../src/auth/session.js";

const config: AppConfig = {
  giteaBaseUrl: "https://gitea.example.test",
  oauthClientId: "validation-client",
  oauthClientSecret: "validation-secret",
  oauthRedirectUri: "https://portal.example.test/auth/callback",
  oauthScope: "read:user",
  giteaTimeoutMs: 1000,
  sessionSecret: "local-validation-secret-that-is-long-enough",
  webOrigin: "https://portal.example.test",
  port: 3001,
};

const originalFetch = globalThis.fetch;
const originalSession = {
  login: "engineer",
  accessToken: "session-token-for-validation",
  expiresAt: Date.now() + 60_000,
  csrfToken: "preserved-csrf-token",
  fullName: "Cached Name",
  avatarUrl: "https://gitea.example.test/cached-avatar.png",
};

async function run() {
  const app = await buildApp(config);
  try {
    globalThis.fetch = async (input, init) => {
      const url = new URL(String(input));
      assert.equal(
        url.pathname,
        "/api/v1/user",
        "profile refresh must use Gitea current-user GET",
      );
      assert.equal(
        init?.method,
        undefined,
        "profile refresh must stay read-only",
      );
      assert.equal(
        new Headers(init?.headers).get("authorization"),
        `token ${originalSession.accessToken}`,
      );
      return new Response(
        JSON.stringify({
          login: "engineer",
          full_name: "Alex Lin",
          avatar_url: "https://gitea.example.test/avatars/engineer.png",
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      );
    };
    const refreshed = await app.inject({
      method: "GET",
      url: "/api/session",
      headers: { ...sessionCookie(), authorization: "Bearer attacker-token" },
    });
    assert.equal(refreshed.statusCode, 200);
    assert.deepEqual(refreshed.json(), {
      login: "engineer",
      displayName: "Alex Lin",
      avatarUrl: "https://gitea.example.test/avatars/engineer.png",
    });
    for (const secret of [
      originalSession.accessToken,
      originalSession.csrfToken,
    ]) {
      assert.equal(
        refreshed.body.includes(secret),
        false,
        "public session response must not expose credentials",
      );
    }
    assert.equal(
      refreshed.body.includes(String(originalSession.expiresAt)),
      false,
      "public session response must not expose expiry",
    );
    const updatedCookie = cookieHeader(refreshed.headers["set-cookie"]);
    const updatedSession = decodeSession(
      updatedCookie.match(/portal_session=([^;]+)/)?.[1],
      config.sessionSecret,
    );
    assert.equal(updatedSession?.fullName, "Alex Lin");
    assert.equal(
      updatedSession?.avatarUrl,
      "https://gitea.example.test/avatars/engineer.png",
    );
    assert.equal(updatedSession?.expiresAt, originalSession.expiresAt);
    assert.equal(updatedSession?.csrfToken, originalSession.csrfToken);

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ login: "engineer" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    const missingProfile = await app.inject({
      method: "GET",
      url: "/api/session",
      headers: sessionCookie(),
    });
    assert.deepEqual(missingProfile.json(), {
      login: "engineer",
      displayName: "engineer",
    });
    const clearedSession = decodeSession(
      cookieHeader(missingProfile.headers["set-cookie"]).match(
        /portal_session=([^;]+)/,
      )?.[1],
      config.sessionSecret,
    );
    assert.equal(
      clearedSession?.fullName,
      undefined,
      "successful refresh must clear a removed name",
    );
    assert.equal(
      clearedSession?.avatarUrl,
      undefined,
      "successful refresh must clear a removed avatar",
    );
    assert.equal(clearedSession?.expiresAt, originalSession.expiresAt);
    assert.equal(clearedSession?.csrfToken, originalSession.csrfToken);

    for (const status of [403, 503]) {
      globalThis.fetch = async (_input, init) => {
        assert.equal(
          init?.method,
          undefined,
          "profile refresh must stay read-only",
        );
        return new Response("profile unavailable", { status });
      };
      const unavailableProfile = await app.inject({
        method: "GET",
        url: "/api/session",
        headers: sessionCookie(),
      });
      assert.equal(
        unavailableProfile.statusCode,
        200,
        `${status} profile failure must not expire the Portal session`,
      );
      assert.deepEqual(unavailableProfile.json(), {
        login: "engineer",
        displayName: "Cached Name",
        avatarUrl: originalSession.avatarUrl,
      });
    }

    globalThis.fetch = async (_input, init) =>
      await new Promise((_resolve, reject) => {
        init?.signal?.addEventListener(
          "abort",
          () => reject(new DOMException("aborted", "AbortError")),
          { once: true },
        );
      });
    const timedOutProfile = await app.inject({
      method: "GET",
      url: "/api/session",
      headers: sessionCookie(),
    });
    assert.equal(
      timedOutProfile.statusCode,
      200,
      "profile timeout must preserve the Portal session",
    );
    assert.deepEqual(timedOutProfile.json(), {
      login: "engineer",
      displayName: "Cached Name",
      avatarUrl: originalSession.avatarUrl,
    });

    globalThis.fetch = async () =>
      new Response("unauthorized", { status: 401 });
    const expiredAuthorization = await app.inject({
      method: "GET",
      url: "/api/session",
      headers: sessionCookie(),
    });
    assert.equal(
      expiredAuthorization.statusCode,
      401,
      "Gitea 401 must use the existing authentication failure path",
    );
    assert.match(
      cookieHeader(expiredAuthorization.headers["set-cookie"]),
      /portal_session=;.*Max-Age=0/,
    );

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ login: "another-user" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    const mismatchedIdentity = await app.inject({
      method: "GET",
      url: "/api/session",
      headers: sessionCookie(),
    });
    assert.equal(mismatchedIdentity.statusCode, 401);
    assert.match(
      cookieHeader(mismatchedIdentity.headers["set-cookie"]),
      /portal_session=;.*Max-Age=0/,
    );
    console.log(
      "User profile validation passed: read-only refresh, cookie identity, secret filtering, profile clearing, 403/503/timeout fallback, Gitea 401, identity mismatch, and session preservation.",
    );
  } finally {
    globalThis.fetch = originalFetch;
    await app.close();
  }
}

function sessionCookie(): Record<string, string> {
  return {
    cookie: `portal_session=${encodeSession(originalSession, config.sessionSecret)}`,
  };
}

function cookieHeader(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value.join("; ") : (value ?? "");
}

void run();
