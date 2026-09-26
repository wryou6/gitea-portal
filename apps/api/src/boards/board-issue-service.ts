import type { Board, IssueSummary, IssueState } from "@gitea-portal/domain";
import { GiteaClient } from "../gitea/client.js";
import { mapIssue } from "../issues/issue-service.js";

export type BoardIssueQuery = {
  q?: string;
  state?: IssueState | "all";
  assignee?: string;
  label?: string;
  milestone?: string;
  page?: number;
  limit?: number;
};

export async function getBoardIssues(
  client: GiteaClient,
  board: Board,
  query: BoardIssueQuery,
) {
  const requestedPage = Number.isFinite(query.page)
    ? Math.trunc(query.page ?? 1)
    : 1;
  const requestedLimit = Number.isFinite(query.limit)
    ? Math.trunc(query.limit ?? 50)
    : 50;
  const page = Math.max(1, requestedPage);
  const limit = Math.min(100, Math.max(1, requestedLimit));
  const labels = query.label
    ?.split(",")
    .map((label) => label.trim())
    .filter(Boolean);
  const issueGroups = await Promise.all(
    board.repositoryRefs.map((repository) =>
      client.repositoryIssuesAllPages(repository, {
        q: query.q,
        state: query.state ?? "all",
        type: "issues",
        assignee: query.assignee,
        labels,
        milestone: query.milestone,
        limit: 100,
      }),
    ),
  );
  const items: IssueSummary[] = issueGroups.flatMap((issues) =>
    issues.map(mapIssue),
  );
  items.sort((left, right) => {
    const updatedAtOrder =
      Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
    if (Number.isFinite(updatedAtOrder) && updatedAtOrder !== 0)
      return updatedAtOrder;
    const ownerOrder =
      left.owner < right.owner ? -1 : left.owner > right.owner ? 1 : 0;
    const repositoryOrder =
      left.name < right.name ? -1 : left.name > right.name ? 1 : 0;
    return ownerOrder || repositoryOrder || left.number - right.number;
  });
  const offset = (page - 1) * limit;
  return {
    board,
    items: items.slice(offset, offset + limit),
    page,
    limit,
    hasNext: offset + limit < items.length,
  };
}
