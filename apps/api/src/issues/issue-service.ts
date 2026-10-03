import type { IssueSummary, RepositoryRef } from "@gitea-portal/domain";
import {
  issuePriorityFromLabels,
  issueTypeFromLabels,
  resolveIssueStatus,
  STATUS_ACTIONS,
} from "@gitea-portal/domain";
import type { GiteaIssue } from "@gitea-portal/gitea-contracts";
import { GiteaClient } from "../gitea/client.js";

export function mapIssue(issue: GiteaIssue): IssueSummary {
  const resolvedStatus = resolveIssueStatus(issue.state, issue.labels);
  const currentActionLabels = issue.labels.filter((label) => label.name.startsWith("status-action:"));
  const actionKey = currentActionLabels.length === 1
    ? currentActionLabels[0]?.name.slice("status-action:".length)
    : undefined;
  const action = STATUS_ACTIONS.find((candidate) => candidate.key === actionKey);
  const assignees = issue.assignees.map((assignee) => assignee.login);
  const userProfiles = Object.fromEntries(
    [issue.author, issue.assignee, ...issue.assignees]
      .filter((user): user is NonNullable<typeof user> => user !== null)
      .map((user) => [user.login, user]),
  );
  const status = resolvedStatus.kind === "status" ? resolvedStatus.key : "anomaly";
  const nextAction =
    action && resolvedStatus.kind === "status" && action.toState === resolvedStatus.key
      ? action.nextAction
      : resolvedStatus.kind === "status" && resolvedStatus.key === "todo"
        ? assignees.length > 0 ? "開始處理" : "指派負責人"
        : resolvedStatus.kind === "status" && resolvedStatus.key === "in-progress"
          ? "開始實作"
          : resolvedStatus.kind === "status" && resolvedStatus.key === "done"
            ? "無後續動作"
            : "狀態資料異常";
  const nextActionKey =
    action && resolvedStatus.kind === "status" && action.toState === resolvedStatus.key
      ? action.nextActionKey
      : resolvedStatus.kind === "status" && resolvedStatus.key === "todo"
        ? assignees.length > 0 ? "begin-work" : "assign-owner"
        : resolvedStatus.kind === "status" && resolvedStatus.key === "in-progress"
          ? "implement"
          : resolvedStatus.kind === "status" && resolvedStatus.key === "done"
            ? "no-follow-up"
            : "anomaly";
  return {
    owner: issue.repository.owner,
    name: issue.repository.name,
    number: issue.number,
    title: issue.title,
    author: issue.author?.login ?? "",
    userProfiles,
    createdAt: issue.createdAt,
    state: issue.state,
    assignee: issue.assignee?.login ?? assignees[0] ?? null,
    assignees,
    currentOwner: issue.state === "open" ? (assignees[0] ?? null) : null,
    type: issueTypeFromLabels(issue.labels),
    priority: issuePriorityFromLabels(issue.labels),
    labels: issue.labels,
    milestone: issue.milestone?.title ?? null,
    closedAt: issue.closedAt,
    startDate: issue.startDate,
    dueDate: issue.dueDate,
    scheduleStatus: issue.scheduleStatus,
    scheduleAnomaly: issue.scheduleAnomaly,
    updatedAt: issue.updatedAt,
    htmlUrl: issue.htmlUrl,
    status,
    statusAnomaly:
      resolvedStatus.kind === "anomaly"
        ? { reason: resolvedStatus.anomaly, labels: resolvedStatus.labels }
        : undefined,
    lastActionKey: action?.key ?? null,
    nextAction,
    nextActionKey,
  };
}

export async function getIssue(
  client: GiteaClient,
  repository: RepositoryRef,
  number: number,
) {
  const issue = await client.issue(repository, number);
  return { ...mapIssue(issue), body: issue.body };
}
