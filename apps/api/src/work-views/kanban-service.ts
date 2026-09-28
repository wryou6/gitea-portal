import type {
  RepositoryRef,
  StatusColumn,
  StatusViewCard,
} from "@gitea-portal/domain";
import { FIXED_ISSUE_STATUSES } from "@gitea-portal/domain";
import { GiteaClient } from "../gitea/client.js";
import { mapIssue } from "../issues/issue-service.js";

function statusViewCard(card: StatusViewCard): StatusViewCard {
  return {
    ...card,
    visibleLabels: card.labels.filter(
      (label) =>
        !label.name.startsWith("status:") &&
        !label.name.startsWith("status-action:") &&
        !label.name.startsWith("workflow:") &&
        !label.name.startsWith("workflow-action:"),
    ),
  };
}

export async function getStatusColumns(
  client: GiteaClient,
  repositories: RepositoryRef[],
): Promise<StatusColumn[]> {
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
      statusViewCard({ ...issue, visibleLabels: issue.labels }),
    ),
  );
  cards.sort((left, right) =>
    Date.parse(right.updatedAt) - Date.parse(left.updatedAt) ||
    left.owner.localeCompare(right.owner) ||
    left.name.localeCompare(right.name) ||
    left.number - right.number,
  );
  const anomalyCards = cards.filter((card) => card.status === "anomaly");
  const statusColumns = FIXED_ISSUE_STATUSES.map((status) => ({
    stateKey: status.key,
    displayName: status.displayName,
    cards: cards.filter((card) => card.status === status.key),
  }));
  if (anomalyCards.length === 0) return statusColumns;
  return [
    { stateKey: "anomaly", displayName: "狀態異常", cards: anomalyCards },
    ...statusColumns,
  ];
}
