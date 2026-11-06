import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GiteaError, mapGiteaError } from "../../src/gitea/errors.js";

describe("mapGiteaError", () => {
  it("preserves status and response body", () => {
    const error = mapGiteaError(403, "forbidden");
    assert.ok(error instanceof GiteaError);
    assert.equal(error.status, 403);
    assert.equal(error.message, "forbidden");
  });

  it("provides a fallback message for an empty response", () => {
    assert.equal(mapGiteaError(504, "").message, "Gitea request failed with status 504");
  });
});
