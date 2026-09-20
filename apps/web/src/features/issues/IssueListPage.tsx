import { useEffect } from 'react';
import { IssueFilters } from './IssueFilters';
import { IssueRow } from './IssueRow';
import { useIssueListState, type IssueFiltersValue } from './issue-list-state';

const defaults: IssueFiltersValue = { q: '', repository: '', state: 'all', assignee: '', label: '', milestone: '' };
function filtersFromUrl(): IssueFiltersValue {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(Object.keys(defaults).map((key) => [key, params.get(key) ?? defaults[key as keyof IssueFiltersValue]])) as IssueFiltersValue;
}

export function IssueListPage() {
  const { issues, filters, page, hasNext, loading, error, load } = useIssueListState(filtersFromUrl());
  useEffect(() => { void load(filters, Number(new URLSearchParams(window.location.search).get('page') ?? 1)); }, []);
  return <section><div className="page-heading"><div><p className="eyebrow">CROSS-REPOSITORY</p><h1>Issues</h1></div><a className="button" href="/issue/new">建立 Issue</a></div><IssueFilters initial={filters} onSubmit={(next) => load(next, 1)} />{error && <div className="error" role="alert">{error}</div>}{loading && <div className="loading" aria-live="polite">載入中…</div>}<div className="issue-list">{issues.map((issue) => <IssueRow key={`${issue.owner}/${issue.name}#${issue.number}`} issue={issue} />)}{!issues.length && !loading && !error && <div className="empty">沒有符合條件的 Issue</div>}</div><div className="actions pagination"><button type="button" disabled={loading || page <= 1} onClick={() => load(filters, page - 1)}>上一頁</button><span>第 {page} 頁</span><button type="button" disabled={loading || !hasNext} onClick={() => load(filters, page + 1)}>下一頁</button></div></section>;
}
