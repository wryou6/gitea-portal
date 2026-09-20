import { randomUUID } from 'node:crypto';
import type { GiteaComment, GiteaIssue, GiteaRepository, GiteaUser } from '@gitea-portal/gitea-contracts';
import type { IssueState, RepositoryRef } from '@gitea-portal/domain';
import { GiteaError, mapGiteaError } from './errors.js';

type GiteaApiUser = { login?: string; full_name?: string };
type GiteaApiRepository = { owner?: GiteaApiUser | string; name?: string; full_name?: string; html_url?: string };
type GiteaApiLabel = { name?: string; color?: string };
type GiteaApiIssue = {
  repository?: GiteaApiRepository;
  number?: number;
  title?: string;
  body?: string;
  state?: string;
  assignee?: GiteaApiUser | null;
  labels?: GiteaApiLabel[];
  milestone?: { id?: number; title?: string } | null;
  updated_at?: string;
  html_url?: string;
};
type GiteaApiComment = { id?: number; user?: GiteaApiUser; body?: string; created_at?: string; updated_at?: string };
type GiteaApiMilestone = { id?: number; title?: string };

function repositoryRef(repository: GiteaApiRepository | undefined): RepositoryRef {
  const owner = typeof repository?.owner === 'string' ? repository.owner : repository?.owner?.login;
  if (!owner || !repository?.name) throw new GiteaError(502, 'Gitea returned an Issue without repository identity');
  return { owner, name: repository.name };
}

function user(value: GiteaApiUser | null | undefined): GiteaUser | null {
  return value?.login ? { login: value.login, fullName: value.full_name } : null;
}

function normalizeIssue(value: GiteaApiIssue): GiteaIssue {
  const repository = repositoryRef(value.repository);
  if (value.number === undefined || !value.title || !value.state || !value.updated_at || !value.html_url) throw new GiteaError(502, 'Gitea returned an incomplete Issue');
  return {
    repository,
    number: value.number,
    title: value.title,
    body: value.body ?? '',
    state: value.state === 'closed' ? 'closed' : 'open',
    assignee: user(value.assignee),
    labels: (value.labels ?? []).filter((label): label is { name: string; color?: string } => Boolean(label.name)).map((label) => ({ name: label.name, color: label.color })),
    milestone: value.milestone?.title && value.milestone.id !== undefined ? { id: value.milestone.id, title: value.milestone.title } : null,
    updatedAt: value.updated_at,
    htmlUrl: value.html_url,
  };
}

function normalizeComment(value: GiteaApiComment): GiteaComment {
  if (value.id === undefined || !value.user?.login || value.created_at === undefined) throw new Error('Gitea returned an incomplete Comment');
  return { id: value.id, user: { login: value.user.login, fullName: value.user.full_name }, body: value.body ?? '', createdAt: value.created_at, updatedAt: value.updated_at };
}

function normalizeRepository(value: GiteaApiRepository): GiteaRepository {
  const repository = repositoryRef(value);
  return { ...repository, fullName: value.full_name ?? `${repository.owner}/${repository.name}`, htmlUrl: value.html_url ?? '' };
}

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
  constructor(private readonly baseUrl: string, private readonly token?: string, private readonly timeoutMs = 10000, private readonly logger?: (details: Record<string, unknown>, message: string) => void, private readonly requestId: string = randomUUID()) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const startedAt = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}/api/v1${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'X-Request-ID': this.requestId,
          ...(this.token ? { Authorization: `token ${this.token}` } : {}),
          ...(init.body ? { 'Content-Type': 'application/json' } : {}),
          ...init.headers,
        },
      });
      this.logger?.({ correlationId: this.requestId, path, statusCode: response.status, elapsedMs: Date.now() - startedAt }, 'Gitea request completed');
      if (!response.ok) throw mapGiteaError(response.status, await response.text());
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw new GiteaError(504, `Gitea request timed out after ${this.timeoutMs}ms`);
      if (error instanceof GiteaError) throw error;
      const message = error instanceof Error ? error.message : String(error);
      this.logger?.({ correlationId: this.requestId, path, elapsedMs: Date.now() - startedAt, error: message }, 'Gitea request failed');
      throw new GiteaError(502, `Gitea request unavailable: ${message}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  async repositories(): Promise<GiteaRepository[]> {
    const repositories = await this.request<GiteaApiRepository[]>('/user/repos?limit=100');
    return repositories.map(normalizeRepository);
  }

  repositoryPermission(repository: RepositoryRef): Promise<{ pull?: boolean; push?: boolean }> {
    return this.request<{ permissions?: { pull?: boolean; push?: boolean } }>(`/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}`).then((repo) => repo.permissions ?? {});
  }

  private issueSearchParams(query: IssueQuery, page = query.page ?? 1, limit = query.limit ?? 50): URLSearchParams {
    const params = new URLSearchParams();
    if (query.q) params.set('q', query.q);
    params.set('state', query.state ?? 'all');
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (query.labels?.length) params.set('labels', query.labels.join(','));
    if (query.milestone) params.set('milestones', query.milestone);
    return params;
  }

  private async repositoryIssues(repository: RepositoryRef, query: IssueQuery): Promise<GiteaApiIssue[]> {
    const issues: GiteaApiIssue[] = [];
    const limit = 100;
    for (let page = 1; ; page += 1) {
      const params = this.issueSearchParams(query, page, limit);
      if (query.assignee) params.set('assigned_by', query.assignee);
      const pageIssues = await this.request<GiteaApiIssue[]>(`/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/issues?${params}`);
      issues.push(...pageIssues);
      if (pageIssues.length < limit) return issues;
    }
  }

  async searchIssues(query: IssueQuery): Promise<GiteaIssue[]> {
    if (query.repository) {
      const [owner, name] = query.repository.split('/', 2);
      if (!owner || !name) throw new Error('Invalid repository filter');
      const params = this.issueSearchParams(query);
      if (query.assignee) params.set('assigned_by', query.assignee);
      const issues = await this.request<GiteaApiIssue[]>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/issues?${params}`);
      return issues.map(normalizeIssue);
    }

    if (query.assignee) {
      const repositories = await this.repositories();
      const issues = (await Promise.all(repositories.map((repository) => this.repositoryIssues(repository, query)))).flat();
      issues.sort((left, right) => Date.parse(right.updated_at ?? '') - Date.parse(left.updated_at ?? ''));
      const offset = ((query.page ?? 1) - 1) * (query.limit ?? 50);
      return issues.slice(offset, offset + (query.limit ?? 50)).map(normalizeIssue);
    }

    const params = this.issueSearchParams(query);
    const issues = await this.request<GiteaApiIssue[]>(`/repos/issues/search?${params}`);
    return issues.map(normalizeIssue);
  }

  async issue(repository: RepositoryRef, number: number): Promise<GiteaIssue> {
    return normalizeIssue(await this.request<GiteaApiIssue>(`/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/issues/${number}`));
  }

  async comments(repository: RepositoryRef, number: number): Promise<GiteaComment[]> {
    const comments = await this.request<GiteaApiComment[]>(`/repos/${repository.owner}/${repository.name}/issues/${number}/comments`);
    return comments.map(normalizeComment);
  }

  async createIssue(repository: RepositoryRef, payload: unknown): Promise<GiteaIssue> {
    return normalizeIssue(await this.request<GiteaApiIssue>(`/repos/${repository.owner}/${repository.name}/issues`, { method: 'POST', body: JSON.stringify(payload) }));
  }

  async updateIssue(repository: RepositoryRef, number: number, payload: unknown): Promise<GiteaIssue> {
    return normalizeIssue(await this.request<GiteaApiIssue>(`/repos/${repository.owner}/${repository.name}/issues/${number}`, { method: 'PATCH', body: JSON.stringify(payload) }));
  }

  async createComment(repository: RepositoryRef, number: number, body: string): Promise<GiteaComment> {
    return normalizeComment(await this.request<GiteaApiComment>(`/repos/${repository.owner}/${repository.name}/issues/${number}/comments`, { method: 'POST', body: JSON.stringify({ body }) }));
  }

  labels(repository: RepositoryRef): Promise<Array<{ id: number; name: string; color: string }>> {
    return this.request(`/repos/${repository.owner}/${repository.name}/labels?limit=100`);
  }

  async milestones(repository: RepositoryRef): Promise<Array<{ id: number; title: string }>> {
    const milestones = await this.request<GiteaApiMilestone[]>(`/repos/${repository.owner}/${repository.name}/milestones?state=all&limit=100`);
    return milestones.filter((milestone): milestone is { id: number; title: string } => milestone.id !== undefined && Boolean(milestone.title));
  }

  replaceIssueLabels(repository: RepositoryRef, number: number, labelIds: number[]): Promise<unknown> {
    return this.request(`/repos/${repository.owner}/${repository.name}/issues/${number}/labels`, {
      method: 'PUT',
      body: JSON.stringify({ labels: labelIds }),
    });
  }

  async currentUser(): Promise<GiteaUser> {
    const currentUser = await this.request<GiteaApiUser>('/user');
    const normalized = user(currentUser);
    if (!normalized) throw new Error('Gitea returned an incomplete user');
    return normalized;
  }
}
