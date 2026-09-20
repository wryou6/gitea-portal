import type { IssueSummary, RepositoryRef } from '@gitea-portal/domain';
import type { GiteaIssue } from '@gitea-portal/gitea-contracts';
import { GiteaClient, type IssueQuery } from '../gitea/client.js';

export function mapIssue(issue: GiteaIssue): IssueSummary {
  return {
    owner: issue.repository.owner,
    name: issue.repository.name,
    number: issue.number,
    title: issue.title,
    state: issue.state,
    assignee: issue.assignee?.login ?? null,
    labels: issue.labels,
    milestone: issue.milestone?.title ?? null,
    updatedAt: issue.updatedAt,
    htmlUrl: issue.htmlUrl,
    workflowState: 'unconfigured',
  };
}

export async function searchIssues(client: GiteaClient, query: IssueQuery) {
  const result = await client.searchIssues(query);
  return { items: result.data.map(mapIssue), page: query.page ?? 1, limit: query.limit ?? 50, hasNext: result.data.length >= (query.limit ?? 50) };
}

export async function getIssue(client: GiteaClient, repository: RepositoryRef, number: number) {
  const issue = await client.issue(repository, number);
  return { ...mapIssue(issue), body: issue.body };
}
