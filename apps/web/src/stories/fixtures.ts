import type { Issue } from "../lib/api";

export const demoIssue: Issue = {
  owner: "demo",
  name: "frontend",
  number: 42,
  title: "改善跨 Repository Issue 清單的可讀性",
  body: "這是 Storybook 的虛構資料。",
  state: "open",
  type: "feature",
  priority: "high",
  assignee: "engineer",
  labels: [
    { name: "type:feature" },
    { name: "priority:high" },
    { name: "team:frontend" },
  ],
  milestone: "Sprint 12",
  startDate: "2026-09-24",
  dueDate: "2026-09-30",
  scheduleStatus: "scheduled",
  updatedAt: "2026-09-24T08:00:00.000Z",
  htmlUrl: "https://gitea.invalid/demo/frontend/issues/42",
  workflowState: "wip",
};
