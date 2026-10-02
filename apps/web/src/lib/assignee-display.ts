import type { Issue } from "./api";

type AssigneeSource = Pick<
  Issue,
  "state" | "assignee" | "assignees" | "currentOwner"
>;

export function assigneeLoginsForDisplay(issue: AssigneeSource): string[] {
  const roster = issue.assignees.filter(Boolean);
  const preferredPrimary =
    issue.state === "open"
      ? issue.currentOwner
      : (roster[0] ?? issue.assignee);
  const primary = preferredPrimary ?? issue.assignee ?? roster[0];

  return [...new Set([primary, ...roster, issue.assignee].filter(Boolean))] as string[];
}
