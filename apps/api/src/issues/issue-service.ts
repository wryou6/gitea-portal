import type { IssueSummary, RepositoryRef } from "@gitea-portal/domain";
import {
  issuePriorityFromLabels,
  issueTypeFromLabels,
  resolveFixedWorkflowState,
  WORKFLOW_ACTIONS,
} from "@gitea-portal/domain";
import type { GiteaIssue } from "@gitea-portal/gitea-contracts";
import { GiteaClient } from "../gitea/client.js";

export function mapIssue(issue: GiteaIssue): IssueSummary {
  const resolvedWorkflow = resolveFixedWorkflowState(issue.state, issue.labels);
  const actionLabels = issue.labels.filter((label) =>
    label.name.startsWith("workflow-action:"),
  );
  const actionKey =
    actionLabels.length === 1
      ? actionLabels[0]?.name.slice("workflow-action:".length)
      : undefined;
  const action = WORKFLOW_ACTIONS.find(
    (candidate) => candidate.key === actionKey,
  );
  const assignees = issue.assignees.map((assignee) => assignee.login);
  const workflowState =
    resolvedWorkflow.kind === "state" ? resolvedWorkflow.key : "anomaly";
  const nextAction =
    action &&
    resolvedWorkflow.kind === "state" &&
    action.toState === resolvedWorkflow.key
      ? action.nextAction
      : resolvedWorkflow.kind === "state" && resolvedWorkflow.key === "todo"
        ? assignees.length > 0
          ? "開始處理"
          : "指派負責人"
        : resolvedWorkflow.kind === "state" &&
            resolvedWorkflow.key === "in-progress"
          ? "開始實作"
          : resolvedWorkflow.kind === "state" && resolvedWorkflow.key === "done"
            ? "無後續動作"
            : "狀態資料異常";
  return {
    owner: issue.repository.owner,
    name: issue.repository.name,
    number: issue.number,
    title: issue.title,
    state: issue.state,
    assignee: issue.assignee?.login ?? assignees[0] ?? null,
    assignees,
    currentOwner: issue.state === "open" ? (assignees[0] ?? null) : null,
    type: issueTypeFromLabels(issue.labels),
    priority: issuePriorityFromLabels(issue.labels),
    labels: issue.labels,
    milestone: issue.milestone?.title ?? null,
    startDate: issue.startDate,
    dueDate: issue.dueDate,
    scheduleStatus: issue.scheduleStatus,
    scheduleAnomaly: issue.scheduleAnomaly,
    updatedAt: issue.updatedAt,
    htmlUrl: issue.htmlUrl,
    workflowState,
    workflowAnomaly:
      resolvedWorkflow.kind === "anomaly"
        ? { reason: resolvedWorkflow.anomaly, labels: resolvedWorkflow.labels }
        : undefined,
    lastActionKey: action?.key ?? null,
    nextAction,
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
