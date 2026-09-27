import type {
  RepositoryRef,
  WorkflowColumn,
  WorkflowViewCard,
} from "@gitea-portal/domain";
import { FIXED_WORKFLOW_STATES } from "@gitea-portal/domain";
import { GiteaClient } from "../gitea/client.js";
import { mapIssue } from "../issues/issue-service.js";

function workflowViewCard(card: WorkflowViewCard): WorkflowViewCard {
  return {
    ...card,
    visibleLabels: card.labels.filter(
      (label) =>
        !label.name.startsWith("workflow:") &&
        !label.name.startsWith("workflow-action:"),
    ),
  };
}

export async function getWorkflowColumns(
  client: GiteaClient,
  repositories: RepositoryRef[],
): Promise<WorkflowColumn[]> {
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
      workflowViewCard({ ...issue, visibleLabels: issue.labels }),
    ),
  );
  cards.sort((left, right) =>
    Date.parse(right.updatedAt) - Date.parse(left.updatedAt) ||
    left.owner.localeCompare(right.owner) ||
    left.name.localeCompare(right.name) ||
    left.number - right.number,
  );
  const anomalyCards = cards.filter(
    (card) => card.workflowState === "anomaly",
  );
  const stateColumns = FIXED_WORKFLOW_STATES.map((state) => ({
    stateKey: state.key,
    displayName: state.displayName,
    cards: cards.filter((card) => card.workflowState === state.key),
  }));
  if (anomalyCards.length === 0) return stateColumns;
  return [
    { stateKey: "anomaly", displayName: "狀態異常", cards: anomalyCards },
    ...stateColumns,
  ];
}
