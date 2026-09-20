import type { Issue, WorkflowRepair } from '../../lib/api';
export type Board = { id: string; name: string; repositoryRefs: Array<{ owner: string; name: string }>; workflowConventionId: string; workflowConventionVersion: string; createdAt: string; updatedAt: string };
export type BoardCard = Issue & { workflowRepair?: WorkflowRepair };
export type BoardView = { board: Board; columns: Array<{ stateKey: string; displayName: string; cards: BoardCard[] }> };
