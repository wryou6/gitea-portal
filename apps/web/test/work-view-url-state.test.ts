import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildWorkViewSearch,
  sanitizeWorkViewSearch,
} from "../src/features/work-views/work-view-url-state.js";

describe("work view URL state", () => {
  it("keeps only valid shared filters when switching views", () => {
    assert.equal(
      buildWorkViewSearch(
        "?state=todo&state=bad&priority=high&gantt_scale=week&sort=title&direction=asc",
        "gantt",
        "issues",
      ),
      "priority=high&state=todo",
    );
  });

  it("removes invalid and retired query state", () => {
    assert.equal(
      sanitizeWorkViewSearch(
        "?state=todo&state=nope&gantt_open=true&gantt_scale=decade&assignee=all",
        "gantt",
      ),
      "state=todo",
    );
  });

  it("defaults to current-user filtering when there is no source view", () => {
    assert.equal(buildWorkViewSearch("", undefined, "kanban"), "assignee=me");
  });
});
