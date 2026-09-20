import type { RepositoryRef } from './repository.js';
import type { IssueLabel, IssueSummary } from './issue.js';

export type Board = {
  id: string;
  name: string;
  repositoryRefs: RepositoryRef[];
  workflowConventionId: string;
  workflowConventionVersion: string;
  createdAt: string;
  updatedAt: string;
};

export type BoardCard = IssueSummary & { visibleLabels: IssueLabel[] };
export type BoardColumn = { stateKey: string; displayName: string; cards: BoardCard[] };
export type BoardView = { board: Board; columns: BoardColumn[] };
