import {
  ISSUE_SORT_FIELDS,
  FIXED_ISSUE_STATUSES,
  type IssueSortField,
  type IssueSummary,
  type SortDirection,
} from "@gitea-portal/domain";
import { GiteaClient, type IssueQuery } from "../gitea/client.js";
import { mapIssue } from "./issue-service.js";
import type { IssueSearchResult } from "@gitea-portal/gitea-contracts";

const priorityOrder = ["critical", "high", "medium", "low"] as const;
const typeOrder = ["bug", "feature", "task"] as const;
const textCollator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

function compareText(left: string, right: string): number {
  return textCollator.compare(left, right);
}

function compareKey(left: IssueSummary, right: IssueSummary): number {
  return compareText(left.owner, right.owner) ||
    compareText(left.name, right.name) ||
    left.number - right.number;
}

function compareNullable<T>(
  left: T | null | undefined,
  right: T | null | undefined,
  compare: (a: T, b: T) => number,
  direction: SortDirection,
): number {
  if (left == null) return right == null ? 0 : 1;
  if (right == null) return -1;
  return compare(left, right) * (direction === "asc" ? 1 : -1);
}

function compareIssueField(
  left: IssueSummary,
  right: IssueSummary,
  field: IssueSortField,
  direction: SortDirection,
): number {
  switch (field) {
    case "type":
      return compareNullable(left.type, right.type, (a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b), direction);
    case "key":
      return compareKey(left, right) * (direction === "asc" ? 1 : -1);
    case "title":
      return compareText(left.title, right.title) * (direction === "asc" ? 1 : -1);
    case "assignee":
      return compareNullable(left.assignee, right.assignee, compareText, direction);
    case "status":
      return compareNullable(left.status, right.status, (a, b) => {
        const aOrder = FIXED_ISSUE_STATUSES.find((state) => state.key === a)?.order ?? 99;
        const bOrder = FIXED_ISSUE_STATUSES.find((state) => state.key === b)?.order ?? 99;
        return aOrder - bOrder;
      }, direction);
    case "priority":
      return compareNullable(left.priority, right.priority, (a, b) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b), direction);
    case "createdAt":
      return compareText(left.createdAt, right.createdAt) * (direction === "asc" ? 1 : -1);
    case "startDate":
      return compareNullable(left.startDate, right.startDate, compareText, direction);
    case "dueDate":
      return compareNullable(left.dueDate, right.dueDate, compareText, direction);
    case "author":
      return compareText(left.author, right.author) * (direction === "asc" ? 1 : -1);
  }
}

export function isIssueSortField(value: string): value is IssueSortField {
  return (ISSUE_SORT_FIELDS as readonly string[]).includes(value);
}

export async function searchIssuesReadThrough(
  client: GiteaClient,
  query: IssueQuery,
): Promise<IssueSearchResult> {
  const sort = query.sort ?? "key";
  const direction = query.direction ?? "asc";
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
    if (query.portalStatuses?.length && !query.portalStatuses.includes(issue.status as (typeof query.portalStatuses)[number])) return false;
    if (query.assignee === "unassigned" && issue.assignees.length > 0) return false;
    if (query.assignee && query.assignee !== "unassigned" && !issue.assignees.includes(query.assignee)) return false;
    if (query.priority?.length && (!issue.priority || !query.priority.includes(issue.priority))) return false;
    if (query.issueType?.length && (!issue.type || !query.issueType.includes(issue.type))) return false;
    if (query.milestone && issue.milestone !== query.milestone) return false;
    if (query.labels?.some((label) => !issue.labels.some((item) => item.name === label))) return false;
    return true;
  });
  matches.sort((left, right) =>
    compareIssueField(left, right, sort, direction) || compareKey(left, right),
  );
  return {
    items: matches,
    sort,
    direction,
  };
}
