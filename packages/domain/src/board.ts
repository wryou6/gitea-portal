import type { RepositoryRef } from './repository.js';

export type Board = {
  id: string;
  name: string;
  repositoryRefs: RepositoryRef[];
  workflowConventionId: string;
  workflowConventionVersion: string;
  createdAt: string;
  updatedAt: string;
};
