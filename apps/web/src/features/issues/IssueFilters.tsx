import { useState } from 'react';

export type IssueFiltersValue = { q: string; repository: string; state: string; assignee: string; label: string; milestone: string };

export function IssueFilters({ initial, onSubmit }: { initial: IssueFiltersValue; onSubmit: (filters: IssueFiltersValue) => void }) {
  const [filters, setFilters] = useState<IssueFiltersValue>(initial);
  const update = (key: keyof IssueFiltersValue, value: string) => setFilters((current) => ({ ...current, [key]: value }));
  return <form className="filters" onSubmit={(event) => { event.preventDefault(); onSubmit(filters); }}>
    <input aria-label="關鍵字" placeholder="搜尋 Issue" value={filters.q} onChange={(e) => update('q', e.target.value)} />
    <input aria-label="Repository" placeholder="owner/repository" value={filters.repository} onChange={(e) => update('repository', e.target.value)} />
    <select aria-label="狀態" value={filters.state} onChange={(e) => update('state', e.target.value)}><option value="all">全部</option><option value="open">Open</option><option value="closed">Closed</option></select>
    <input aria-label="Assignee" placeholder="Assignee" value={filters.assignee} onChange={(e) => update('assignee', e.target.value)} />
    <input aria-label="Label" placeholder="Label（workflow 或一般分類）" value={filters.label} onChange={(e) => update('label', e.target.value)} />
    <input aria-label="Milestone" placeholder="Milestone" value={filters.milestone} onChange={(e) => update('milestone', e.target.value)} />
    <button type="submit">搜尋</button>
  </form>;
}
