import type { RepositoryRef } from './repository.js';
import type { IssueSummary } from './issue.js';

export type Board = {
  id: string;
  name: string;
  repositoryRefs: RepositoryRef[];
  workflowConventionId: string;
  workflowConventionVersion: string;
  createdAt: string;
  updatedAt: string;
};

export type BoardColumn = { stateKey: string; displayName: string; cards: IssueSummary[] };
export type BoardView = { board: Board; columns: BoardColumn[] };
