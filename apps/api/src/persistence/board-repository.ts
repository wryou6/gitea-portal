import { randomUUID } from 'node:crypto';
import type { Board, RepositoryRef } from '@gitea-portal/domain';
import { Database } from './database.js';

export type BoardInput = Omit<Board, 'id' | 'createdAt' | 'updatedAt'>;

export class BoardRepository {
  constructor(private readonly database = new Database()) {}

  list(): Board[] { return [...this.database.boards.values()]; }
  get(id: string): Board | undefined { return this.database.boards.get(id); }
  create(input: BoardInput): Board {
    this.assertUniqueRepositories(input.repositoryRefs);
    const now = new Date().toISOString();
    const board: Board = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
    this.database.boards.set(board.id, board);
    return board;
  }
  update(id: string, input: BoardInput): Board | undefined {
    this.assertUniqueRepositories(input.repositoryRefs, id);
    const current = this.database.boards.get(id);
    if (!current) return undefined;
    const board = { ...current, ...input, updatedAt: new Date().toISOString() };
    this.database.boards.set(id, board);
    return board;
  }
  delete(id: string): boolean { return this.database.boards.delete(id); }

  private assertUniqueRepositories(refs: RepositoryRef[], boardId?: string): void {
    const keys = refs.map((ref) => `${ref.owner}/${ref.name}`);
    if (new Set(keys).size !== keys.length) throw new Error('Duplicate repository in Board');
    for (const board of this.database.boards.values()) {
      if (board.id === boardId) continue;
      if (board.repositoryRefs.some((ref) => keys.includes(`${ref.owner}/${ref.name}`))) continue;
    }
  }
}
