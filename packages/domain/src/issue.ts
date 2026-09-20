import type { RepositoryRef } from './repository.js';

export type IssueState = 'open' | 'closed';
export type IssueIdentity = RepositoryRef & { number: number };

export type IssueLabel = { name: string; color?: string };
export type WorkflowRepairErrorCode =
  | 'permission_denied'
  | 'missing_label'
  | 'concurrent_change'
  | 'external_unavailable'
  | 'persist_failed'
  | 'unknown';

export type WorkflowRepair = {
  outcome: 'repaired' | 'failed';
  sourceState: 'unconfigured' | 'conflict';
  errorCode?: WorkflowRepairErrorCode;
  message?: string;
};

export type IssueSummary = IssueIdentity & {
  title: string;
  state: IssueState;
  assignee: string | null;
  labels: IssueLabel[];
  milestone: string | null;
  updatedAt: string;
  htmlUrl: string;
  workflowState: string;
  workflowRepair?: WorkflowRepair;
};
