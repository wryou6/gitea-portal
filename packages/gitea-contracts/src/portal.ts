import type {
  IssueSummary,
  RepositoryWorkspace,
  WorkflowColumn,
  WorkflowViewCard,
} from "@gitea-portal/domain";
import type { GiteaRepository } from "./gitea.js";

export type IssuePage = {
  items: IssueSummary[];
  page: number;
  limit: number;
  hasNext: boolean;
};
export type RepositoryWorkspaceView = GiteaRepository;
export type RepositoryKanbanView = {
  repository: RepositoryWorkspaceView;
  columns: WorkflowColumn[];
};
export type RepositoryGanttView = {
  repository: RepositoryWorkspaceView;
  issues: IssueSummary[];
};
export type AllRepositoriesKanbanView = {
  repositories: RepositoryWorkspaceView[];
  columns: WorkflowColumn[];
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
export type IssueViewCard = WorkflowViewCard;
export type WorkflowTransitionInput = {
  actionKey: string;
  selectedAssignee?: string;
  expectedUpdatedAt: string;
};
export type Session = { login: string; displayName?: string };
