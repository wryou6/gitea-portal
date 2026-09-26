import { IssueListPage } from "../features/issues/IssueListPage";
import { IssueDetailPage } from "../features/issues/IssueDetailPage";
import { IssueCreatePage } from "../features/issues/IssueCreatePage";
import { BoardListPage } from "../features/boards/BoardListPage";
import { KanbanBoard } from "../features/boards/KanbanBoard";
import { AppShell } from "../components/layout/AppShell";

export function App() {
  const match = window.location.pathname.match(
    /^\/issue\/([^/]+)\/([^/]+)\/(\d+)$/,
  );
  const boardMatch = window.location.pathname.match(/^\/boards\/([^/]+)(?:\/(kanban|gantt))?$/);
  const content =
    window.location.pathname === "/issue/new" ? (
      <IssueCreatePage />
    ) : match ? (
      <IssueDetailPage
        owner={match[1]!}
        repo={match[2]!}
        number={Number(match[3])}
      />
    ) : boardMatch ? (
      <KanbanBoard boardId={boardMatch[1]!} viewMode={boardMatch[2] === "gantt" ? "gantt" : "kanban"} />
    ) : window.location.pathname === "/boards" ? (
      <BoardListPage />
    ) : (
      <IssueListPage />
    );
  return <AppShell>{content}</AppShell>;
}
