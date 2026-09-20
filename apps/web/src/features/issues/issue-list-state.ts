import { useCallback, useState } from 'react';
import { queryIssues, type Issue } from '../../lib/api';

export type IssueFiltersValue = { q: string; repository: string; state: string; assignee: string; label: string; milestone: string };
export function useIssueListState(initial: IssueFiltersValue): { issues: Issue[]; filters: IssueFiltersValue; page: number; hasNext: boolean; loading: boolean; error?: string; load: (next?: IssueFiltersValue, page?: number) => Promise<void> } {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filters, setFilters] = useState(initial);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const load = useCallback(async (next = filters, requestedPage = 1) => { setFilters(next); setLoading(true); setError(undefined); try { const result = await queryIssues({ ...next, page: String(requestedPage) }); setIssues(result.items); setPage(result.page); setHasNext(result.hasNext); const params = new URLSearchParams(Object.entries(next).filter(([, value]) => value)); params.set('page', String(result.page)); window.history.replaceState({}, '', `${window.location.pathname}?${params}`); } catch (cause) { setError(cause instanceof Error ? cause.message : '無法取得 Gitea Issues'); } finally { setLoading(false); } }, [filters]);
  return { issues, filters, page, hasNext, loading, error, load };
}
