import type { GiteaComment, GiteaIssue, GiteaRepository, GiteaUser } from '@gitea-portal/gitea-contracts';
import type { IssueState, RepositoryRef } from '@gitea-portal/domain';
import { mapGiteaError } from './errors.js';

export type IssueQuery = {
  q?: string;
  repository?: string;
  state?: IssueState | 'all';
  page?: number;
  limit?: number;
  labels?: string[];
  assignee?: string;
  milestone?: string;
};

export class GiteaClient {
  constructor(private readonly baseUrl: string, private readonly token?: string) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}/api/v1${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(this.token ? { Authorization: `token ${this.token}` } : {}),
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
    if (!response.ok) throw mapGiteaError(response.status, await response.text());
    return (await response.json()) as T;
  }

  repositories(): Promise<GiteaRepository[]> {
    return this.request('/user/repos?limit=100');
  }

  searchIssues(query: IssueQuery): Promise<{ data: GiteaIssue[]; total: number }> {
    const params = new URLSearchParams();
    if (query.q) params.set('q', query.q);
    if (query.repository) params.set('repo', query.repository);
    params.set('state', query.state ?? 'all');
    params.set('page', String(query.page ?? 1));
    params.set('limit', String(query.limit ?? 50));
    if (query.labels?.length) params.set('labels', query.labels.join(','));
    if (query.assignee) params.set('assigned', query.assignee);
    if (query.milestone) params.set('milestones', query.milestone);
    return this.request(`/repos/issues/search?${params}`);
  }

  issue(repository: RepositoryRef, number: number): Promise<GiteaIssue> {
    return this.request(`/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/issues/${number}`);
  }

  comments(repository: RepositoryRef, number: number): Promise<GiteaComment[]> {
    return this.request(`/repos/${repository.owner}/${repository.name}/issues/${number}/comments`);
  }

  createIssue(repository: RepositoryRef, payload: unknown): Promise<GiteaIssue> {
    return this.request(`/repos/${repository.owner}/${repository.name}/issues`, { method: 'POST', body: JSON.stringify(payload) });
  }

  updateIssue(repository: RepositoryRef, number: number, payload: unknown): Promise<GiteaIssue> {
    return this.request(`/repos/${repository.owner}/${repository.name}/issues/${number}`, { method: 'PATCH', body: JSON.stringify(payload) });
  }

  createComment(repository: RepositoryRef, number: number, body: string): Promise<GiteaComment> {
    return this.request(`/repos/${repository.owner}/${repository.name}/issues/${number}/comments`, { method: 'POST', body: JSON.stringify({ body }) });
  }

  labels(repository: RepositoryRef): Promise<Array<{ id: number; name: string; color: string }>> {
    return this.request(`/repos/${repository.owner}/${repository.name}/labels?limit=100`);
  }

  replaceIssueLabels(repository: RepositoryRef, number: number, labelIds: number[]): Promise<unknown> {
    return this.request(`/repos/${repository.owner}/${repository.name}/issues/${number}/labels`, {
      method: 'PUT',
      body: JSON.stringify({ labels: labelIds }),
    });
  }

  currentUser(): Promise<GiteaUser> { return this.request('/user'); }
}
