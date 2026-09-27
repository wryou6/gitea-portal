import type {
  Board,
  BoardCard as DomainBoardCard,
  BoardColumn,
  BoardGanttView as DomainBoardGanttView,
  IssueSummary,
  RepositoryWorkspace,
} from "@gitea-portal/domain";
import type { GiteaRepository } from "./gitea.js";

export type IssuePage = {
  items: IssueSummary[];
  page: number;
  limit: number;
  hasNext: boolean;
};
export type BoardCard = DomainBoardCard;
export type BoardView = {
  board: Board;
  columns: Array<{ stateKey: string; displayName: string; cards: BoardCard[] }>;
};
export type BoardGanttView = DomainBoardGanttView;
export type BoardIssuePage = {
  board: Board;
  items: IssueSummary[];
  page: number;
  limit: number;
  hasNext: boolean;
};
export type RepositoryWorkspaceView = GiteaRepository;
export type RepositoryKanbanView = {
  repository: RepositoryWorkspaceView;
  columns: BoardColumn[];
};
export type RepositoryGanttView = {
  repository: RepositoryWorkspaceView;
  issues: IssueSummary[];
};
export type WorkflowTransitionInput = {
  actionKey: string;
  selectedAssignee?: string;
  expectedUpdatedAt: string;
};
export type Session = { login: string; displayName?: string };
