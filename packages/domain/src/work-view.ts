import type { IssueLabel, IssueSummary } from "./issue.js";

export type StatusViewCard = IssueSummary & { visibleLabels: IssueLabel[] };
export type StatusColumn = {
  stateKey: string;
  displayName: string;
  cards: StatusViewCard[];
};
