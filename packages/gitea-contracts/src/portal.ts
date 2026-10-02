import type {
  IssueSummary,
  IssueSortField,
  RepositoryWorkspace,
  SortDirection,
  StatusColumn,
  StatusViewCard,
} from "@gitea-portal/domain";
import type { GiteaRepository } from "./gitea.js";

export type IssueSearchResult = {
  items: IssueSummary[];
  sort: IssueSortField;
  direction: SortDirection;
};
export type RepositoryWorkspaceView = GiteaRepository;
export type RepositoryKanbanView = {
  repository: RepositoryWorkspaceView;
  columns: StatusColumn[];
};
export type RepositoryGanttView = {
  repository: RepositoryWorkspaceView;
  issues: IssueSummary[];
};
export type AllRepositoriesKanbanView = {
  repositories: RepositoryWorkspaceView[];
  columns: StatusColumn[];
};
export type AllRepositoriesGanttView = {
  repositories: RepositoryWorkspaceView[];
  issues: IssueSummary[];
};
export type WorkspaceKanbanView =
  | RepositoryKanbanView
  | AllRepositoriesKanbanView;
export type WorkspaceGanttView =
  | RepositoryGanttView
  | AllRepositoriesGanttView;
export type IssueViewCard = StatusViewCard;
export type StatusTransitionInput = {
  actionKey: string;
  selectedAssignee?: string;
  expectedUpdatedAt: string;
};
export type StatusLabelMigrationReport = {
  repositories: number;
  issuesScanned: number;
  migrated: number;
  unchanged: number;
  successfulIssues: Array<{
    owner: string;
    repository: string;
    issueNumber: number;
    outcome: "migrated" | "unchanged";
  }>;
  resolvedConflicts: Array<{
    owner: string;
    repository: string;
    issueNumber: number;
    removedLegacyLabels: string[];
    retainedStatusLabels: string[];
  }>;
  failures: Array<{
    owner: string;
    repository: string;
    issueNumber?: number;
    reason: string;
  }>;
  verified: boolean;
};
export type Session = { login: string; displayName?: string };
