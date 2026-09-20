import type { Board, IssueSummary, WorkflowConvention, WorkflowRepair } from '@gitea-portal/domain';

export type IssuePage = { items: IssueSummary[]; page: number; limit: number; hasNext: boolean };
export type WorkflowRepairView = WorkflowRepair;
export type BoardCard = IssueSummary;
export type BoardView = { board: Board; columns: Array<{ stateKey: string; displayName: string; cards: BoardCard[] }> };
export type Session = { login: string; displayName?: string };
export type WorkflowConventionView = WorkflowConvention;
