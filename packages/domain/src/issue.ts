import type { RepositoryRef } from "./repository.js";
import type { IssueType } from "./issue-type.js";
import type { IssuePriority } from "./issue-priority.js";
import type { FixedWorkflowStateKey } from "./workflow.js";

export type IssueState = "open" | "closed";
export type IssueIdentity = RepositoryRef & { number: number };

export type IssueLabel = { name: string; color?: string };
export type IssueScheduleStatus = "scheduled" | "unscheduled" | "invalid";
export type IssueScheduleAnomaly =
  | "invalid_start_date"
  | "multiple_start_dates"
  | "invalid_due_date"
  | "date_range_reversed";
export type IssueSchedule = {
  startDate: string | null;
  dueDate: string | null;
  scheduleStatus: IssueScheduleStatus;
  scheduleAnomaly?: IssueScheduleAnomaly;
};
export type IssueSummary = IssueIdentity &
  IssueSchedule & {
    title: string;
    state: IssueState;
    assignee: string | null;
    assignees: string[];
    currentOwner: string | null;
    type: IssueType | null;
    priority: IssuePriority | null;
    labels: IssueLabel[];
    milestone: string | null;
    updatedAt: string;
    htmlUrl: string;
    workflowState: FixedWorkflowStateKey | "anomaly";
    workflowAnomaly?: {
      reason: string;
      labels: string[];
    };
    lastActionKey: string | null;
    nextAction: string;
    nextActionKey: string;
  };
