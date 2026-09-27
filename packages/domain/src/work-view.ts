import type { IssueLabel, IssueSummary } from "./issue.js";

export type WorkflowViewCard = IssueSummary & { visibleLabels: IssueLabel[] };
export type WorkflowColumn = {
  stateKey: string;
  displayName: string;
  cards: WorkflowViewCard[];
};
