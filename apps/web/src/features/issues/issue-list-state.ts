import { useCallback, useState } from 'react';
import { queryIssues, type Issue } from '../../lib/api';

export type IssueFiltersValue = { q: string; repository: string; state: string; assignee: string; label: string; milestone: string };
export function useIssueListState(initial: IssueFiltersValue): { issues: Issue[]; filters: IssueFiltersValue; loading: boolean; error?: string; load: (next?: IssueFiltersValue) => Promise<void> } {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filters, setFilters] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const load = useCallback(async (next = filters) => { setFilters(next); setLoading(true); setError(undefined); try { setIssues((await queryIssues(next)).items); } catch (cause) { setError(cause instanceof Error ? cause.message : '無法取得 Gitea Issues'); } finally { setLoading(false); } }, [filters]);
  return { issues, filters, loading, error, load };
}
