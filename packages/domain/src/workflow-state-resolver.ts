import type { IssueLabel } from './issue.js';
import type { WorkflowConvention } from './workflow.js';

export type ResolvedWorkflowState =
  | { kind: 'unconfigured' }
  | { kind: 'conflict'; labels: string[] }
  | { kind: 'state'; key: string; displayName: string; order: number };

export function resolveWorkflowState(
  labels: IssueLabel[],
  convention: WorkflowConvention,
): ResolvedWorkflowState {
  const workflowLabels = labels.filter((label) =>
    convention.states.some((state) => state.labelName === label.name),
  );
  if (workflowLabels.length === 0) return { kind: 'unconfigured' };
  if (workflowLabels.length > 1) {
    return { kind: 'conflict', labels: workflowLabels.map((label) => label.name) };
  }
  const state = convention.states.find(
    (candidate) => candidate.labelName === workflowLabels[0]?.name,
  );
  if (!state) return { kind: 'unconfigured' };
  return { kind: 'state', key: state.key, displayName: state.displayName, order: state.order };
}
