import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GiteaClient } from "../../src/gitea/client.js";
import { GiteaError } from "../../src/gitea/errors.js";
import { withMockGitea } from "../helpers/mock-gitea.js";

describe("GiteaClient HTTP contract", () => {
  it("sends the delegated token and request id to Gitea", async () => {
    await withMockGitea(
      ({ url, init }) => {
        assert.equal(url, "http://gitea.test/api/v1/user");
        const headers = new Headers(init?.headers);
        assert.equal(
          headers.get("Authorization"),
          "token delegated-test-token",
        );
        assert.equal(headers.get("X-Request-ID"), "test-request-id");
        return Response.json({ login: "engineer", full_name: "Engineer" });
      },
      async () => {
        const client = new GiteaClient(
          "http://gitea.test",
          "delegated-test-token",
          500,
          undefined,
          "test-request-id",
        );
        assert.deepEqual(await client.currentUser(), {
          login: "engineer",
          fullName: "Engineer",
          avatarUrl: undefined,
        });
      },
    );
  });

  it("preserves Gitea authorization failures", async () => {
    await withMockGitea(
      () => new Response("forbidden", { status: 403 }),
      async () => {
        const client = new GiteaClient(
          "http://gitea.test",
          "delegated-test-token",
          500,
        );
        await assert.rejects(
          client.currentUser(),
          (error: unknown) =>
            error instanceof GiteaError &&
            error.status === 403 &&
            error.message === "forbidden",
        );
      },
    );
  });
});
