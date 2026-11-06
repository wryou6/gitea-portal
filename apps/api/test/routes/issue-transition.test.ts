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

    await withMockGitea(
      ({ url, init }) => {
        requests.push({ url, method: init?.method });
        if (url.endsWith("/repos/owner/repo"))
          return Response.json({ permissions: { pull: true, push: true } });
        if (url.endsWith("/repos/owner/repo/issues/1"))
          return Response.json(issue);
        throw new Error(`Unexpected Gitea request: ${url}`);
      },
      async () => {
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
      },
    );

    assert.deepEqual(
      requests.map((request) => request.method ?? "GET"),
      ["GET", "GET", "GET"],
    );
  });

  it("preserves ordinary labels with one atomic Gitea replacement", async () => {
    const app = await appPromise;
    const labelDefinitions = [
      { id: 1, name: "status:todo", color: "000000" },
      { id: 2, name: "keep-me", color: "000000" },
      { id: 3, name: "status:in-progress", color: "000000" },
      { id: 4, name: "status-action:start-work", color: "000000" },
    ];
    let currentLabels = ["status:todo", "keep-me"];
    let replacements = 0;

    const currentIssue = () => ({
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
      labels: currentLabels.map((name) => ({ name })),
      created_at: "2026-10-01T08:00:00.000Z",
      updated_at: "2026-10-01T08:00:00.000Z",
      html_url: "http://gitea.test/owner/repo/issues/1",
    });

    await withMockGitea(
      ({ url, init }) => {
        const requestUrl = new URL(url);
        const method = init?.method ?? "GET";
        if (requestUrl.pathname.endsWith("/repos/owner/repo"))
          return Response.json({ permissions: { pull: true, push: true } });
        if (requestUrl.pathname.endsWith("/repos/owner/repo/labels"))
          return Response.json(
            requestUrl.searchParams.get("page") === "1" ? labelDefinitions : [],
          );
        if (
          requestUrl.pathname.endsWith("/issues/1/labels") &&
          method === "PUT"
        ) {
          replacements += 1;
          const body = JSON.parse(String(init?.body)) as { labels: number[] };
          currentLabels = body.labels.map(
            (id) => labelDefinitions.find((label) => label.id === id)!.name,
          );
          return Response.json([]);
        }
        if (requestUrl.pathname.endsWith("/issues/1"))
          return Response.json(currentIssue());
        throw new Error(`Unexpected Gitea request: ${method} ${url}`);
      },
      async () => {
        const response = await app.inject({
          method: "POST",
          url: "/api/issues/owner/repo/1/transition",
          headers: headers(),
          payload: {
            actionKey: "start-work",
            expectedUpdatedAt: "2026-10-01T08:00:00.000Z",
          },
        });

        assert.equal(response.statusCode, 200, response.body);
        assert.equal(response.json().status, "in-progress");
        assert.deepEqual(
          response.json().labels.map((label: { name: string }) => label.name),
          ["keep-me", "status:in-progress", "status-action:start-work"],
        );
      },
    );

    assert.equal(replacements, 1);
  });
});
