import type { IssueLabel, IssueState } from "./issue.js";
import {
  FIXED_ISSUE_STATUSES,
  type FixedIssueStatusKey,
} from "./status.js";

export type IssueStatusAnomaly =
  | "missing-status-label"
  | "conflicting-status-labels"
  | "unknown-status-label"
  | "status-mismatch";

export type ResolvedIssueStatus =
  | {
      kind: "status";
      key: FixedIssueStatusKey;
      displayName: string;
      order: number;
    }
  | { kind: "anomaly"; anomaly: IssueStatusAnomaly; labels: string[] };

export function resolveIssueStatus(
  state: IssueState,
  labels: IssueLabel[],
): ResolvedIssueStatus {
  const currentLabels = labels.filter((label) => label.name.startsWith("status:"));
  const statusLabels = currentLabels;
  const knownLabels = FIXED_ISSUE_STATUSES.filter(
    (candidate) => candidate.labelName !== null,
  );
  const selected = statusLabels.filter((label) =>
    knownLabels.some((candidate) =>
      candidate.labelName === label.name,
    ),
  );

  if (statusLabels.length > 1) {
    return {
      kind: "anomaly",
      anomaly: "conflicting-status-labels",
      labels: statusLabels.map((label) => label.name),
    };
  }
  if (statusLabels.length === 1 && selected.length === 0) {
    return {
      kind: "anomaly",
      anomaly: "unknown-status-label",
      labels: statusLabels.map((label) => label.name),
    };
  }
  if (state === "closed") {
    if (statusLabels.length > 0) {
      return {
        kind: "anomaly",
        anomaly: "status-mismatch",
        labels: statusLabels.map((label) => label.name),
      };
    }
    const done = FIXED_ISSUE_STATUSES.find((candidate) => candidate.key === "done");
    if (!done) throw new Error("Fixed Issue Status is missing the done state");
    return { kind: "status", key: done.key, displayName: done.displayName, order: done.order };
  }
  if (statusLabels.length === 0) {
    return { kind: "anomaly", anomaly: "missing-status-label", labels: [] };
  }
  const labelName = statusLabels[0]?.name;
  const resolvedStatus = knownLabels.find((candidate) => candidate.labelName === labelName);
  if (!resolvedStatus || resolvedStatus.giteaState !== state) {
    return {
      kind: "anomaly",
      anomaly: "status-mismatch",
      labels: statusLabels.map((label) => label.name),
    };
  }
  return {
    kind: "status",
    key: resolvedStatus.key,
    displayName: resolvedStatus.displayName,
    order: resolvedStatus.order,
  };
}
