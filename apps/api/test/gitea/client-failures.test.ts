import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GiteaClient } from "../../src/gitea/client.js";
import { GiteaError } from "../../src/gitea/errors.js";
import { withMockGitea } from "../helpers/mock-gitea.js";

describe("GiteaClient failure handling", () => {
  for (const status of [401, 403, 404, 429, 500]) {
    it(`preserves HTTP ${status} errors`, async () => {
      const client = new GiteaClient("http://gitea.test", "delegated-test-token");
      await withMockGitea(
        () => new Response("upstream failure", { status }),
        async () => {
          await assert.rejects(client.repositories(), (error: unknown) => {
            assert.ok(error instanceof GiteaError);
            assert.equal(error.status, status);
            assert.match(error.message, /upstream failure/);
            return true;
          });
        },
      );
    });
  }

  it("uses a fallback message for empty error bodies", async () => {
    const client = new GiteaClient("http://gitea.test");
    await withMockGitea(
      () => new Response(null, { status: 503 }),
      async () => {
        await assert.rejects(client.repositories(), (error: unknown) => {
          assert.ok(error instanceof GiteaError);
          assert.equal(error.status, 503);
          assert.match(error.message, /503/);
          return true;
        });
      },
    );
  });

  it("does not put delegated tokens in adapter error logs", async () => {
    const token = "delegated-secret-for-log-test";
    const logs: string[] = [];
    const client = new GiteaClient(
      "http://gitea.test",
      token,
      1000,
      (details, message) => logs.push(JSON.stringify({ details, message })),
      "test-request-id",
    );

    await withMockGitea(
      () => new Response("denied", { status: 403 }),
      async () => assert.rejects(client.repositories()),
    );

    assert.ok(logs.length > 0);
    assert.ok(logs.every((entry) => !entry.includes(token)));
  });

  it("maps abort timeouts to a Portal-recognizable Gitea error", async () => {
    const client = new GiteaClient("http://gitea.test", undefined, 5);
    await withMockGitea(
      ({ init }) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
      async () => {
        await assert.rejects(client.repositories(), (error: unknown) => {
          assert.ok(error instanceof GiteaError);
          assert.equal(error.status, 504);
          assert.match(error.message, /timed out/);
          return true;
        });
      },
    );
  });

  it("does not treat invalid JSON success bodies as valid data", async () => {
    const client = new GiteaClient("http://gitea.test");
    await withMockGitea(
      () => new Response("{broken", { status: 200 }),
      async () =>
        assert.rejects(client.repositories(), (error: unknown) => {
          assert.ok(error instanceof GiteaError);
          assert.equal(error.status, 502);
          assert.match(error.message, /Gitea request unavailable/);
          return true;
        }),
    );
  });
});
