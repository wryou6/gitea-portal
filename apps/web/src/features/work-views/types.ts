import type {
  AllRepositoriesGanttView,
  AllRepositoriesKanbanView,
  Issue,
  RepositoryGanttView,
  RepositoryKanbanView,
} from "../../lib/api";

export type WorkViewCard = Issue & {
  visibleLabels: Array<{ name: string; color?: string }>;
};
export type WorkspaceKanbanView =
  | AllRepositoriesKanbanView
  | RepositoryKanbanView;
export type WorkspaceGanttView =
  | AllRepositoriesGanttView
  | RepositoryGanttView;
