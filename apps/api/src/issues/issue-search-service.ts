import type { IssueSummary } from '@gitea-portal/domain';
import { GiteaClient, type IssueQuery } from '../gitea/client.js';
import { mapIssue } from './issue-service.js';

export async function searchIssuesReadThrough(client: GiteaClient, query: IssueQuery): Promise<{ items: IssueSummary[]; page: number; limit: number; hasNext: boolean }> {
  const limit = Math.min(Math.max(query.limit ?? 50, 1), 100);
  const page = Math.max(query.page ?? 1, 1);
  const result = await client.searchIssues({ ...query, page, limit });
  return { items: result.data.map(mapIssue), page, limit, hasNext: result.data.length >= limit };
}
