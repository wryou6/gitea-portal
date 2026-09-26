import type { RepositoryRef } from "./repository.js";
import type { IssueType } from "./issue-type.js";

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
export type WorkflowRepairErrorCode =
  | "permission_denied"
  | "missing_label"
  | "concurrent_change"
  | "external_unavailable"
  | "persist_failed"
  | "unknown";

export type WorkflowRepair = {
  outcome: "repaired" | "failed";
  sourceState: "unconfigured" | "conflict";
  errorCode?: WorkflowRepairErrorCode;
  message?: string;
};

export type IssueSummary = IssueIdentity &
  IssueSchedule & {
    title: string;
    state: IssueState;
    assignee: string | null;
    type: IssueType | null;
    labels: IssueLabel[];
    milestone: string | null;
    updatedAt: string;
    htmlUrl: string;
    workflowState: string;
    workflowRepair?: WorkflowRepair;
  };
