import { useEffect } from 'react';
import { IssueFilters } from './IssueFilters';
import { IssueRow } from './IssueRow';
import { useIssueListState } from './issue-list-state';

export function IssueListPage() {
  const { issues, loading, error, load } = useIssueListState({ q: '', repository: '', state: 'all', assignee: '', label: '', milestone: '' });
  useEffect(() => { void load(); }, []);
  return <section><div className="page-heading"><div><p className="eyebrow">CROSS-REPOSITORY</p><h1>Issues</h1></div><a className="button" href="/issue/new">建立 Issue</a></div><IssueFilters onSubmit={load} />{error && <div className="error" role="alert">{error}</div>}{loading && <div className="loading" aria-live="polite">載入中…</div>}<div className="issue-list">{issues.map((issue) => <IssueRow key={`${issue.owner}/${issue.name}#${issue.number}`} issue={issue} />)}{!issues.length && !loading && !error && <div className="empty">沒有符合條件的 Issue</div>}</div></section>;
}
