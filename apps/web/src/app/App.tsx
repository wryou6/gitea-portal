import { IssueListPage } from '../features/issues/IssueListPage';
import { IssueDetailPage } from '../features/issues/IssueDetailPage';
import { IssueCreatePage } from '../features/issues/IssueCreatePage';
import { BoardListPage } from '../features/boards/BoardListPage';
import { KanbanBoard } from '../features/boards/KanbanBoard';

export function App() {
  const match = window.location.pathname.match(/^\/issue\/([^/]+)\/([^/]+)\/(\d+)$/);
  const boardMatch = window.location.pathname.match(/^\/boards\/([^/]+)$/);
  const content = window.location.pathname === '/issue/new' ? <IssueCreatePage /> : match ? <IssueDetailPage owner={match[1]!} repo={match[2]!} number={Number(match[3])} /> : boardMatch ? <KanbanBoard boardId={boardMatch[1]!} /> : window.location.pathname === '/boards' ? <BoardListPage /> : <IssueListPage />;
  return <div className="app-shell"><header className="topbar"><a className="brand" href="/">Gitea Issue Portal</a><nav><a href="/">Issues</a><a href="/boards">Boards</a></nav></header><main>{content}</main></div>;
}
