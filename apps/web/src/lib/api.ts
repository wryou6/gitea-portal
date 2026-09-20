export type Issue = {
  owner: string; name: string; number: number; title: string; state: 'open' | 'closed';
  assignee: string | null; labels: Array<{ name: string }>; milestone: string | null;
  updatedAt: string; htmlUrl: string; workflowState: string;
};

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (!response.ok) throw new Error(await response.text());
  return response.status === 204 ? (undefined as T) : response.json() as Promise<T>;
}

export function queryIssues(filters: Record<string, string>): Promise<{ items: Issue[]; page: number; limit: number; hasNext: boolean }> {
  const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
  return api(`/api/issues?${params}`);
}
