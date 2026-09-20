import { randomUUID } from 'node:crypto';
import type { Board, RepositoryRef } from '@gitea-portal/domain';
import { JsonBoardStore, validateBoard } from './database.js';

export type BoardInput = Omit<Board, 'id' | 'createdAt' | 'updatedAt'>;

export class BoardRepository {
  readonly store: JsonBoardStore;
  constructor(filePath: string) { this.store = new JsonBoardStore(filePath); }
  initialize(): Promise<void> { return this.store.initialize(); }
  list(): Promise<Board[]> { return this.store.readBoards(); }
  async get(id: string): Promise<Board | undefined> { return (await this.store.readBoards()).find((board) => board.id === id); }
  async create(input: BoardInput): Promise<Board> {
    this.assertUniqueRepositories(input.repositoryRefs);
    const now = new Date().toISOString(); const board = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
    validateBoard(board);
    return this.store.transaction((boards) => ({ boards: [...boards, board], result: board }));
  }
  async update(id: string, input: BoardInput): Promise<Board | undefined> {
    this.assertUniqueRepositories(input.repositoryRefs);
    return this.store.transaction((boards) => { const index = boards.findIndex((board) => board.id === id); if (index < 0) return { boards, result: undefined }; const board = { ...boards[index]!, ...input, updatedAt: new Date().toISOString() }; validateBoard(board); boards[index] = board; return { boards, result: board }; });
  }
  async delete(id: string): Promise<boolean> { return this.store.transaction((boards) => ({ boards: boards.filter((board) => board.id !== id), result: boards.some((board) => board.id === id) })); }
  private assertUniqueRepositories(refs: RepositoryRef[]): void { const keys = refs.map((ref) => `${ref.owner}/${ref.name}`); if (new Set(keys).size !== keys.length) throw new Error('Duplicate repository in Board'); }
}
