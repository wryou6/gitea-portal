import { KanbanBoard } from "./KanbanBoard";

export function WorkspaceViewPage({ view }: { view: "kanban" | "gantt" }) {
  return <KanbanBoard viewMode={view} />;
}
