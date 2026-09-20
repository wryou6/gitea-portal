import type { Board, IssueSummary, WorkflowConvention } from '@gitea-portal/domain';

export type IssuePage = { items: IssueSummary[]; page: number; limit: number; hasNext: boolean };
export type BoardView = { board: Board; columns: Array<{ stateKey: string; displayName: string; cards: IssueSummary[] }> };
export type Session = { login: string; displayName?: string };
export type WorkflowConventionView = WorkflowConvention;
