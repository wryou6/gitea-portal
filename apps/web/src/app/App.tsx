import { IssueListPage } from '../features/issues/IssueListPage';
import { IssueDetailPage } from '../features/issues/IssueDetailPage';

export function App() {
  const match = window.location.pathname.match(/^\/issue\/([^/]+)\/([^/]+)\/(\d+)$/);
  const content = match ? <IssueDetailPage owner={match[1]!} repo={match[2]!} number={Number(match[3])} /> : <IssueListPage />;
  return <div className="app-shell"><header className="topbar"><a className="brand" href="/">Gitea Issue Portal</a><nav><a href="/">Issues</a><a href="/boards">Boards</a></nav></header><main>{content}</main></div>;
}
