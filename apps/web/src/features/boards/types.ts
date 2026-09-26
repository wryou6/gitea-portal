import type { Issue, WorkflowRepair } from "../../lib/api";
import type { RepositoryGanttView, RepositoryKanbanView } from "../../lib/api";
export type BoardGanttView = { board: Board; issues: Issue[] };
export type Board = {
  id: string;
  name: string;
  repositoryRefs: Array<{ owner: string; name: string }>;
  workflowConventionId: string;
  workflowConventionVersion: string;
  createdAt: string;
  updatedAt: string;
};
export type BoardCard = Issue & {
  workflowRepair?: WorkflowRepair;
  visibleLabels: Array<{ name: string; color?: string }>;
};
export type BoardView = {
  board: Board;
  columns: Array<{ stateKey: string; displayName: string; cards: BoardCard[] }>;
};
export type WorkspaceKanbanView = BoardView | RepositoryKanbanView;
export type WorkspaceGanttView = BoardGanttView | RepositoryGanttView;
