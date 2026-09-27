import type {
  Board,
  BoardCard,
  BoardColumn,
  BoardView,
  RepositoryRef,
} from "@gitea-portal/domain";
import { FIXED_WORKFLOW_STATES } from "@gitea-portal/domain";
import { GiteaClient } from "../gitea/client.js";
import { mapIssue } from "../issues/issue-service.js";

function boardCardView(issue: BoardCard): BoardCard {
  return {
    ...issue,
    visibleLabels: issue.labels.filter(
      (label) =>
        !label.name.startsWith("workflow:") &&
        !label.name.startsWith("workflow-action:"),
    ),
  };
}

export async function getWorkflowColumns(
  client: GiteaClient,
  repositories: RepositoryRef[],
): Promise<BoardColumn[]> {
  const issueGroups = await Promise.all(
    repositories.map((repository) =>
      client.repositoryIssuesAllPages(repository, {
        state: "all",
        type: "issues",
      }),
    ),
  );
  const cards = issueGroups.flatMap((issues) =>
    issues.map(mapIssue).map((issue) =>
      boardCardView({
        ...issue,
        visibleLabels: issue.labels,
      }),
    ),
  );
  const anomalyCards = cards.filter((card) => card.workflowState === "anomaly");
  const stateColumns = FIXED_WORKFLOW_STATES.map((state) => ({
    stateKey: state.key,
    displayName: state.displayName,
    cards: cards.filter((card) => card.workflowState === state.key),
  }));
  if (anomalyCards.length === 0) return stateColumns;
  return [
    {
      stateKey: "anomaly",
      displayName: "狀態異常",
      cards: anomalyCards,
    },
    ...stateColumns,
  ];
}

export async function getBoardView(
  client: GiteaClient,
  board: Board,
): Promise<BoardView> {
  return {
    board,
    columns: await getWorkflowColumns(client, board.repositoryRefs),
  };
}
