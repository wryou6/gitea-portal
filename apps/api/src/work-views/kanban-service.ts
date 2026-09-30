import type {
  RepositoryRef,
  StatusColumn,
  StatusViewCard,
} from "@gitea-portal/domain";
import { FIXED_ISSUE_STATUSES } from "@gitea-portal/domain";
import { GiteaClient } from "../gitea/client.js";
import { mapIssue } from "../issues/issue-service.js";

const PRIORITY_ORDER = ["critical", "high", "medium", "low"] as const;

function compareIssueIdentity(
  left: StatusViewCard,
  right: StatusViewCard,
): number {
  return (
    left.owner.localeCompare(right.owner) ||
    left.name.localeCompare(right.name) ||
    left.number - right.number
  );
}

function compareActionableCards(
  left: StatusViewCard,
  right: StatusViewCard,
): number {
  const leftPriority = left.priority
    ? PRIORITY_ORDER.indexOf(left.priority)
    : PRIORITY_ORDER.length;
  const rightPriority = right.priority
    ? PRIORITY_ORDER.indexOf(right.priority)
    : PRIORITY_ORDER.length;
  const priorityOrder = leftPriority - rightPriority;
  if (priorityOrder !== 0) return priorityOrder;

  const leftDueDate = left.dueDate;
  const rightDueDate = right.dueDate;
  if (leftDueDate !== rightDueDate) {
    if (leftDueDate === null) return 1;
    if (rightDueDate === null) return -1;
    return leftDueDate.localeCompare(rightDueDate);
  }

  return (
    Date.parse(left.updatedAt) - Date.parse(right.updatedAt) ||
    compareIssueIdentity(left, right)
  );
}

function compareCompletedCards(
  left: StatusViewCard,
  right: StatusViewCard,
): number {
  return (
    Date.parse(right.updatedAt) - Date.parse(left.updatedAt) ||
    compareIssueIdentity(left, right)
  );
}

function sortCards(
  cards: StatusViewCard[],
  status: StatusViewCard["status"],
): StatusViewCard[] {
  return cards.sort(
    status === "done" ? compareCompletedCards : compareActionableCards,
  );
}

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
  const anomalyCards = sortCards(
    cards.filter((card) => card.status === "anomaly"),
    "anomaly",
  );
  const statusColumns = FIXED_ISSUE_STATUSES.map((status) => ({
    stateKey: status.key,
    displayName: status.displayName,
    cards: sortCards(
      cards.filter((card) => card.status === status.key),
      status.key,
    ),
  }));
  if (anomalyCards.length === 0) return statusColumns;
  return [
    { stateKey: "anomaly", displayName: "狀態異常", cards: anomalyCards },
    ...statusColumns,
  ];
}
