import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PortalError } from "../../src/errors.js";
import { replaceIssueLabelsAtomically } from "../../src/gitea/label-replacement.js";
import type { GiteaClient } from "../../src/gitea/client.js";

const repository = { owner: "owner", name: "repo" };
const issue = (updatedAt: string, labels: string[]) => ({
  number: 1,
  updatedAt,
  labels: labels.map((name) => ({ name })),
}) as never;

describe("replaceIssueLabelsAtomically", () => {
  it("rejects a stale issue before writing labels", async () => {
    let writes = 0;
    const client = {
      issue: async () => issue("new-version", ["status:todo", "keep-me"]),
      replaceIssueLabels: async () => { writes += 1; },
    } as unknown as GiteaClient;

    await assert.rejects(
      replaceIssueLabelsAtomically(client, repository, 1, "old-version", ["status:todo", "keep-me"], [2], ["status:in-progress"]),
      (error: unknown) => error instanceof PortalError && error.status === 409,
    );
    assert.equal(writes, 0);
  });

  it("uses one replacement call and verifies the final label set", async () => {
    let reads = 0;
    let writes = 0;
    const client = {
      issue: async () => ++reads === 1
        ? issue("same-version", ["status:todo", "keep-me"])
        : issue("next-version", ["status:in-progress", "keep-me"]),
      replaceIssueLabels: async (_repo: unknown, _number: number, ids: number[]) => {
        writes += 1;
        assert.deepEqual(ids, [2, 3]);
      },
    } as unknown as GiteaClient;

    await replaceIssueLabelsAtomically(client, repository, 1, "same-version", ["status:todo", "keep-me"], [2, 3], ["status:in-progress", "keep-me"]);
    assert.equal(writes, 1);
    assert.equal(reads, 2);
  });
});
