import type { Board, BoardCard as DomainBoardCard, IssueSummary, WorkflowConvention, WorkflowRepair } from '@gitea-portal/domain';

export type IssuePage = { items: IssueSummary[]; page: number; limit: number; hasNext: boolean };
export type WorkflowRepairView = WorkflowRepair;
export type BoardCard = DomainBoardCard;
export type BoardView = { board: Board; columns: Array<{ stateKey: string; displayName: string; cards: BoardCard[] }> };
export type Session = { login: string; displayName?: string };
export type WorkflowConventionView = WorkflowConvention;
