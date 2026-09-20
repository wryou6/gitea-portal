import { randomUUID } from 'node:crypto';
import type { Board, RepositoryRef } from '@gitea-portal/domain';

export type BoardInput = Omit<Board, 'id' | 'createdAt' | 'updatedAt'>;

export class BoardRepository {
  private readonly boards = new Map<string, Board>();

  list(): Board[] { return [...this.boards.values()]; }
  get(id: string): Board | undefined { return this.boards.get(id); }
  create(input: BoardInput): Board {
    const now = new Date().toISOString();
    const board: Board = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
    this.boards.set(board.id, board);
    return board;
  }
  update(id: string, input: BoardInput): Board | undefined {
    const current = this.boards.get(id);
    if (!current) return undefined;
    const board = { ...current, ...input, updatedAt: new Date().toISOString() };
    this.boards.set(id, board);
    return board;
  }
  delete(id: string): boolean { return this.boards.delete(id); }
}
