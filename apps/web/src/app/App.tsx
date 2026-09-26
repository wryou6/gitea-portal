import { IssueListPage } from "../features/issues/IssueListPage";
import { IssueDetailPage } from "../features/issues/IssueDetailPage";
import { IssueCreatePage } from "../features/issues/IssueCreatePage";
import { BoardListPage } from "../features/boards/BoardListPage";
import { KanbanBoard } from "../features/boards/KanbanBoard";
import { AppShell } from "../components/layout/AppShell";
import { resolveAppRoute } from "./routes";

export function App() {
  const route = resolveAppRoute(
    window.location.pathname,
    window.location.search,
  );
  const content = (() => {
    switch (route.type) {
      case "issue-create":
        return <IssueCreatePage />;
      case "issue-detail":
        return (
          <IssueDetailPage
            owner={route.owner}
            repo={route.repo}
            number={route.number}
          />
        );
      case "board-view":
        return <KanbanBoard boardId={route.boardId} viewMode={route.view} />;
      case "board-selection":
        return <BoardListPage viewIntent={route.viewIntent} />;
      case "board-settings":
        return <BoardListPage />;
      case "issues":
        return <IssueListPage />;
    }
  })();
  return <AppShell>{content}</AppShell>;
}
