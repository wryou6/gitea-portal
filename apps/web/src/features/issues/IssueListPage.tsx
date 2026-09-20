import { useEffect, useState } from 'react';
import { queryIssues, type Issue } from '../../lib/api';
import { IssueFilters, type IssueFiltersValue } from './IssueFilters';

export function IssueListPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [error, setError] = useState<string>();
  const load = async (filters: IssueFiltersValue = { q: '', repository: '', state: 'all', assignee: '', label: '', milestone: '' }) => {
    try { setError(undefined); setIssues((await queryIssues(filters)).items); } catch (cause) { setError(cause instanceof Error ? cause.message : '無法取得 Gitea Issues'); }
  };
  useEffect(() => { void load(); }, []);
  return <section><div className="page-heading"><div><p className="eyebrow">CROSS-REPOSITORY</p><h1>Issues</h1></div><a className="button" href="/issue/new">建立 Issue</a></div><IssueFilters onSubmit={load} />{error && <div className="error" role="alert">{error}</div>}<div className="issue-list">{issues.map((issue) => <article className="issue-row" key={`${issue.owner}/${issue.name}#${issue.number}`}><div><a href={`/issue/${issue.owner}/${issue.name}/${issue.number}`} className="issue-title">{issue.title}</a><div className="meta"><span>{issue.owner}/{issue.name} #{issue.number}</span><span className={issue.state}>{issue.state}</span><span>{issue.assignee ?? '未指派'}</span></div></div><div className="labels">{issue.labels.map((label) => <span key={label.name} className="label">{label.name}</span>)}</div></article>)}{!issues.length && !error && <div className="empty">沒有符合條件的 Issue</div>}</div></section>;
}
