import type { Board, BoardGanttView } from "@gitea-portal/domain";
import { GiteaClient } from "../gitea/client.js";
import { mapIssue } from "../issues/issue-service.js";

export async function getBoardGanttView(
  client: GiteaClient,
  board: Board,
): Promise<BoardGanttView> {
  const issueGroups = await Promise.all(
    board.repositoryRefs.map((repository) =>
      client.repositoryIssuesAllPages(repository, {
        state: "all",
        type: "issues",
        limit: 100,
      }),
    ),
  );
  return {
    board,
    issues: issueGroups.flatMap((issues) => issues.map(mapIssue)),
  };
}
