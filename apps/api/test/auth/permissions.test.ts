import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canAccessRepository } from "../../src/auth/permissions.js";
import type { GiteaClient } from "../../src/gitea/client.js";

describe("canAccessRepository", () => {
  it("requires pull for reads and push for writes", async () => {
    const client = {
      repositoryPermission: async () => ({ pull: true, push: false }),
    } as unknown as GiteaClient;
    assert.equal(
      await canAccessRepository(client, { owner: "o", name: "r" }, "read"),
      true,
    );
    assert.equal(
      await canAccessRepository(client, { owner: "o", name: "r" }, "update"),
      false,
    );
  });

  it("fails closed when permission lookup fails", async () => {
    const client = {
      repositoryPermission: async () => {
        throw new Error("denied");
      },
    } as unknown as GiteaClient;
    assert.equal(
      await canAccessRepository(client, { owner: "o", name: "r" }, "read"),
      false,
    );
    assert.equal(
      await canAccessRepository(client, { owner: "o", name: "r" }, "create"),
      false,
    );
  });
});
