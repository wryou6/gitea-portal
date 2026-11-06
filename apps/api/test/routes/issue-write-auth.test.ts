import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { buildApp } from "../../src/app.js";
import type { AppConfig } from "../../src/config/env.js";
import { encodeSession } from "../../src/auth/session.js";
import { withMockGitea } from "../helpers/mock-gitea.js";

const config: AppConfig = {
  giteaBaseUrl: "http://gitea.test",
  oauthClientId: "test-client",
  oauthClientSecret: "fake-secret",
  oauthRedirectUri: "http://portal.test/auth/callback",
  oauthScope: "read:user read:repository read:issue write:issue",
  giteaTimeoutMs: 1000,
  sessionSecret: "test-session-secret-not-for-production",
  webOrigin: "http://portal.test",
  port: 3001,
};

const appPromise = buildApp(config);
const writes = [
  {
    method: "POST",
    url: "/api/repositories/owner/repo/issues",
    payload: {},
  },
  {
    method: "PATCH",
    url: "/api/issues/owner/repo/1",
    payload: {},
  },
  {
    method: "POST",
    url: "/api/issues/owner/repo/1/comments",
    payload: { body: "comment" },
  },
  {
    method: "POST",
    url: "/api/issues/owner/repo/1/transition",
    payload: {},
  },
] as const;

function sessionCookie(expiresAt = Date.now() + 60_000) {
  return encodeSession(
    {
      login: "engineer",
      accessToken: "delegated-test-token",
      expiresAt,
      csrfToken: "test-csrf",
    },
    config.sessionSecret,
  );
}

after(async () => (await appPromise).close());

describe("authenticated issue write route boundaries", () => {
  it("rejects missing, invalid, and expired sessions before any Gitea request", async () => {
    const app = await appPromise;
    let requests = 0;

    await withMockGitea(() => {
      requests += 1;
      return Response.json({});
    }, async () => {
      for (const write of writes) {
        const missing = await app.inject(write);
        assert.equal(missing.statusCode, 401, write.url);

        const expired = await app.inject({
          ...write,
          headers: {
            cookie: `portal_session=${sessionCookie(Date.now() - 1)}`,
          },
        });
        assert.equal(expired.statusCode, 401, write.url);

        const invalidCookie = sessionCookie().replace(/.$/, "x");
        const invalid = await app.inject({
          ...write,
          headers: { cookie: `portal_session=${invalidCookie}` },
        });
        assert.equal(invalid.statusCode, 401, write.url);
      }
    });

    assert.equal(requests, 0);
  });

  it("rejects missing CSRF tokens before any Gitea request", async () => {
    const app = await appPromise;
    let requests = 0;

    await withMockGitea(() => {
      requests += 1;
      return Response.json({});
    }, async () => {
      for (const write of writes) {
        const response = await app.inject({
          ...write,
          headers: { cookie: `portal_session=${sessionCookie()}` },
        });
        assert.equal(response.statusCode, 403, write.url);
        assert.equal(response.json().code, "auth.csrf_failed");
      }
    });

    assert.equal(requests, 0);
  });

  it("rejects writes when Gitea reports no push permission", async () => {
    const app = await appPromise;
    let permissionReads = 0;
    let writesToGitea = 0;

    await withMockGitea(({ url }) => {
      if (url.endsWith("/repos/owner/repo")) {
        permissionReads += 1;
        return Response.json({ permissions: { pull: true, push: false } });
      }
      writesToGitea += 1;
      return Response.json({});
    }, async () => {
      for (const write of writes) {
        const response = await app.inject({
          ...write,
          headers: {
            cookie: `portal_session=${sessionCookie()}; portal_csrf=test-csrf`,
            "x-csrf-token": "test-csrf",
          },
        });
        assert.equal(response.statusCode, 403, write.url);
      }
    });

    assert.equal(permissionReads, writes.length);
    assert.equal(writesToGitea, 0);
  });
});
