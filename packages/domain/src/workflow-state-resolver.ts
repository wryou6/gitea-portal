import type { IssueLabel } from './issue.js';
import type { WorkflowConvention, WorkflowState } from './workflow.js';

export type ResolvedWorkflowState =
  | { kind: 'unconfigured' }
  | { kind: 'conflict'; labels: string[] }
  | { kind: 'state'; key: string; displayName: string; order: number };

export function validateWorkflowConvention(convention: WorkflowConvention): void {
  if (!convention.states?.length) {
    throw new Error(`Workflow Convention ${convention.id}@${convention.version} must define at least one state`);
  }
  const keys = new Set<string>();
  const labels = new Set<string>();
  const orders = new Set<number>();
  for (const state of convention.states) {
    if (!state.key || !state.labelName || state.order < 0) {
      throw new Error(`Invalid Workflow state in ${convention.id}@${convention.version}`);
    }
    if (keys.has(state.key) || labels.has(state.labelName) || orders.has(state.order)) {
      throw new Error(`Invalid duplicate Workflow state in ${convention.id}@${convention.version}`);
    }
    keys.add(state.key);
    labels.add(state.labelName);
    orders.add(state.order);
  }
}

export function getDefaultWorkflowState(convention: WorkflowConvention): WorkflowState {
  validateWorkflowConvention(convention);
  return convention.states.reduce((minimum, state) => state.order < minimum.order ? state : minimum);
}

export function resolveWorkflowState(
  labels: IssueLabel[],
  convention: WorkflowConvention,
): ResolvedWorkflowState {
  validateWorkflowConvention(convention);
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
