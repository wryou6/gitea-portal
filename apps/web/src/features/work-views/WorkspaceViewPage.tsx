import { KanbanBoard } from "./KanbanBoard";

export function WorkspaceViewPage({ view, login }: { view: "kanban" | "gantt"; login?: string }) {
  return <KanbanBoard viewMode={view} login={login} />;
}
