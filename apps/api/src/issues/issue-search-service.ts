import type { IssueSummary } from '@gitea-portal/domain';
import { GiteaClient, type IssueQuery } from '../gitea/client.js';
import { mapIssue } from './issue-service.js';

export async function searchIssuesReadThrough(client: GiteaClient, query: IssueQuery): Promise<{ items: IssueSummary[]; page: number; limit: number; hasNext: boolean }> {
  const limit = Math.min(Math.max(query.limit ?? 50, 1), 100);
  const page = Math.max(query.page ?? 1, 1);
  const repositories = await client.repositories();
  const scopedRepositories = query.repository
    ? repositories.filter((repository) => `${repository.owner}/${repository.name}` === query.repository)
    : repositories;
  const groups = await Promise.all(scopedRepositories.map((repository) =>
    client.repositoryIssuesAllPages(repository, { state: "all", type: "issues" }),
  ));
  const normalizedQuery = (query.q ?? "").trim().toLocaleLowerCase();
  const matches = groups.flatMap((issues) => issues
    .filter((rawIssue) => !normalizedQuery || `${rawIssue.title}\n${rawIssue.body}\n${rawIssue.number}\n${rawIssue.repository.owner}/${rawIssue.repository.name}`.toLocaleLowerCase().includes(normalizedQuery))
    .map(mapIssue),
  ).filter((issue) => {
    if (query.state && query.state !== "all" && issue.state !== query.state) return false;
    if (query.assignee && !issue.assignees.includes(query.assignee)) return false;
    if (query.milestone && issue.milestone !== query.milestone) return false;
    if (query.labels?.some((label) => !issue.labels.some((item) => item.name === label))) return false;
    return true;
  });
  matches.sort((left, right) =>
    Date.parse(right.updatedAt) - Date.parse(left.updatedAt) ||
    left.owner.localeCompare(right.owner) ||
    left.name.localeCompare(right.name) ||
    left.number - right.number,
  );
  const offset = (page - 1) * limit;
  return { items: matches.slice(offset, offset + limit), page, limit, hasNext: matches.length > offset + limit };
}
