import type { IssueLabel, IssueState } from "./issue.js";
import {
  FIXED_WORKFLOW_STATES,
  type FixedWorkflowStateKey,
} from "./workflow.js";

export type FixedWorkflowAnomaly =
  | "missing-state-label"
  | "conflicting-state-labels"
  | "unknown-state-label"
  | "state-mismatch";

export type ResolvedFixedWorkflowState =
  | {
      kind: "state";
      key: FixedWorkflowStateKey;
      displayName: string;
      order: number;
    }
  | { kind: "anomaly"; anomaly: FixedWorkflowAnomaly; labels: string[] };

export function resolveFixedWorkflowState(
  state: IssueState,
  labels: IssueLabel[],
): ResolvedFixedWorkflowState {
  const statusLabels = labels.filter((label) =>
    label.name.startsWith("workflow:"),
  );
  const knownLabels = FIXED_WORKFLOW_STATES.filter(
    (candidate) => candidate.labelName !== null,
  );
  const selected = statusLabels.filter((label) =>
    knownLabels.some((candidate) => candidate.labelName === label.name),
  );

  if (statusLabels.length > 1) {
    return {
      kind: "anomaly",
      anomaly: "conflicting-state-labels",
      labels: statusLabels.map((label) => label.name),
    };
  }
  if (statusLabels.length === 1 && selected.length === 0) {
    return {
      kind: "anomaly",
      anomaly: "unknown-state-label",
      labels: statusLabels.map((label) => label.name),
    };
  }
  if (state === "closed") {
    if (statusLabels.length > 0) {
      return {
        kind: "anomaly",
        anomaly: "state-mismatch",
        labels: statusLabels.map((label) => label.name),
      };
    }
    const done = FIXED_WORKFLOW_STATES.find(
      (candidate) => candidate.key === "done",
    );
    if (!done) throw new Error("Fixed workflow is missing the done state");
    return {
      kind: "state",
      key: done.key,
      displayName: done.displayName,
      order: done.order,
    };
  }
  if (statusLabels.length === 0) {
    return { kind: "anomaly", anomaly: "missing-state-label", labels: [] };
  }
  const workflowState = knownLabels.find(
    (candidate) => candidate.labelName === statusLabels[0]?.name,
  );
  if (!workflowState || workflowState.giteaState !== state) {
    return {
      kind: "anomaly",
      anomaly: "state-mismatch",
      labels: statusLabels.map((label) => label.name),
    };
  }
  return {
    kind: "state",
    key: workflowState.key,
    displayName: workflowState.displayName,
    order: workflowState.order,
  };
}
