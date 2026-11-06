import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { buildApp } from "../../src/app.js";
import type { AppConfig } from "../../src/config/env.js";

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
after(async () => (await appPromise).close());

describe("session API contract", () => {
  it("returns the standard authentication error when no session exists", async () => {
    const response = await (
      await appPromise
    ).inject({ method: "GET", url: "/api/session" });
    assert.equal(response.statusCode, 401);
    assert.deepEqual(response.json(), {
      error: "Authentication required",
      code: "auth.required",
    });
  });

  it("returns health without requiring Gitea credentials or a listener", async () => {
    const response = await (
      await appPromise
    ).inject({ method: "GET", url: "/health" });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { ok: true });
  });
});
