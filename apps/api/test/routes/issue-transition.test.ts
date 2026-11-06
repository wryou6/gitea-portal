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
const csrfToken = "transition-csrf";

function headers() {
  const session = encodeSession(
    {
      login: "engineer",
      accessToken: "delegated-test-token",
      expiresAt: Date.now() + 60_000,
      csrfToken,
    },
    config.sessionSecret,
  );
  return {
    cookie: `portal_session=${session}; portal_csrf=${csrfToken}`,
    "x-csrf-token": csrfToken,
  };
}

after(async () => (await appPromise).close());

describe("Issue status transition route", () => {
  it("returns 409 for a stale expectedUpdatedAt without Gitea writes", async () => {
    const app = await appPromise;
    const requests: Array<{ url: string; method?: string }> = [];
    const issue = {
      repository: {
        owner: { login: "owner" },
        name: "repo",
        full_name: "owner/repo",
        html_url: "http://gitea.test/owner/repo",
      },
      number: 1,
      title: "Keep ordinary label during transition",
      body: "",
      user: { login: "engineer" },
      state: "open",
      assignee: { login: "engineer" },
      assignees: [{ login: "engineer" }],
      labels: [{ name: "status:todo" }, { name: "keep-me" }],
      created_at: "2026-10-01T08:00:00.000Z",
      updated_at: "2026-10-01T08:00:00.000Z",
      html_url: "http://gitea.test/owner/repo/issues/1",
    };

    await withMockGitea(({ url, init }) => {
      requests.push({ url, method: init?.method });
      if (url.endsWith("/repos/owner/repo"))
        return Response.json({ permissions: { pull: true, push: true } });
      if (url.endsWith("/repos/owner/repo/issues/1"))
        return Response.json(issue);
      throw new Error(`Unexpected Gitea request: ${url}`);
    }, async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/issues/owner/repo/1/transition",
        headers: headers(),
        payload: {
          actionKey: "start-work",
          expectedUpdatedAt: "stale-version",
        },
      });

      assert.equal(response.statusCode, 409);
      assert.equal(response.json().code, "resource.conflict");
    });

    assert.deepEqual(
      requests.map((request) => request.method ?? "GET"),
      ["GET", "GET", "GET"],
    );
  });

});
