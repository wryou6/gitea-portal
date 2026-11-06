import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveIssueStatus } from "@gitea-portal/domain";

describe("resolveIssueStatus", () => {
  it("resolves a valid open status label", () => {
    assert.equal(
      resolveIssueStatus("open", [{ name: "status:todo" }]).kind,
      "status",
    );
    const result = resolveIssueStatus("open", [{ name: "status:todo" }]);
    assert.equal(result.kind, "status");
    if (result.kind === "status") {
      assert.equal(result.key, "todo");
      assert.equal(result.displayName, "待辦");
      assert.equal(result.order, 0);
    }
  });

  it("reports missing, unknown, conflicting and mismatched labels", () => {
    const missing = resolveIssueStatus("open", []);
    const unknown = resolveIssueStatus("open", [{ name: "status:custom" }]);
    const conflicting = resolveIssueStatus("open", [
      { name: "status:todo" },
      { name: "status:in-progress" },
    ]);
    const mismatch = resolveIssueStatus("closed", [{ name: "status:todo" }]);
    assert.equal(missing.kind === "anomaly" && missing.anomaly, "missing-status-label");
    assert.equal(unknown.kind === "anomaly" && unknown.anomaly, "unknown-status-label");
    assert.equal(conflicting.kind === "anomaly" && conflicting.anomaly, "conflicting-status-labels");
    assert.equal(mismatch.kind === "anomaly" && mismatch.anomaly, "status-mismatch");
  });

  it("maps a closed issue without a status label to Done", () => {
    const resolved = resolveIssueStatus("closed", []);
    assert.equal(resolved.kind === "status" && resolved.key, "done");
  });
});
