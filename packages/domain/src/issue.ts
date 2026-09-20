import type { RepositoryRef } from './repository.js';

export type IssueState = 'open' | 'closed';
export type IssueIdentity = RepositoryRef & { number: number };

export type IssueLabel = { name: string; color?: string };
export type IssueSummary = IssueIdentity & {
  title: string;
  state: IssueState;
  assignee: string | null;
  labels: IssueLabel[];
  milestone: string | null;
  updatedAt: string;
  htmlUrl: string;
  workflowState: string;
};
