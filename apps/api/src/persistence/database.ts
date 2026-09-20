import { randomUUID } from 'node:crypto';
import { dirname } from 'node:path';
import { mkdir, open, readFile, rename, stat, unlink } from 'node:fs/promises';
import type { Board, RepositoryRef } from '@gitea-portal/domain';

export const BOARD_STORE_SCHEMA_VERSION = 1;
const LOCK_RETRY_MS = 50;
const LOCK_TIMEOUT_MS = 10_000;
const LOCK_STALE_MS = 30_000;

export type BoardStoreDocument = { schemaVersion: number; revision: number; boards: Board[] };
function isNonEmptyString(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0; }
function validateRepositoryRef(value: unknown): value is RepositoryRef { return Boolean(value && typeof value === 'object' && isNonEmptyString((value as RepositoryRef).owner) && isNonEmptyString((value as RepositoryRef).name)); }

export function validateBoard(value: unknown): asserts value is Board {
  if (!value || typeof value !== 'object') throw new Error('Invalid Board JSON: expected object');
  const board = value as Board & Record<string, unknown>;
  const allowed = ['id', 'name', 'repositoryRefs', 'workflowConventionId', 'workflowConventionVersion', 'createdAt', 'updatedAt'];
  if (Object.keys(board).some((key) => !allowed.includes(key))) throw new Error('Invalid Board JSON: unsupported persisted field');
  if (!isNonEmptyString(board.id) || !isNonEmptyString(board.name) || !isNonEmptyString(board.workflowConventionId) || !isNonEmptyString(board.workflowConventionVersion)) throw new Error('Invalid Board JSON: missing required field');
  if (!Array.isArray(board.repositoryRefs) || board.repositoryRefs.length === 0 || !board.repositoryRefs.every(validateRepositoryRef)) throw new Error('Invalid Board JSON: repositoryRefs must be non-empty repository identities');
  const identities = board.repositoryRefs.map((repository) => `${repository.owner}/${repository.name}`);
  if (new Set(identities).size !== identities.length) throw new Error('Invalid Board JSON: duplicate repository identity');
  if (!isNonEmptyString(board.createdAt) || Number.isNaN(Date.parse(board.createdAt)) || !isNonEmptyString(board.updatedAt) || Number.isNaN(Date.parse(board.updatedAt))) throw new Error('Invalid Board JSON: invalid timestamp');
}

export function validateStore(value: unknown): asserts value is BoardStoreDocument {
  if (!value || typeof value !== 'object') throw new Error('Invalid Board store JSON: expected object');
  const store = value as BoardStoreDocument;
  if (store.schemaVersion !== BOARD_STORE_SCHEMA_VERSION) throw new Error(`Unsupported Board store schema version: ${String(store.schemaVersion)}`);
  if (!Number.isInteger(store.revision) || store.revision < 0 || !Array.isArray(store.boards)) throw new Error('Invalid Board store JSON: schema validation failed');
  for (const board of store.boards) validateBoard(board);
  if (new Set(store.boards.map((board) => board.id)).size !== store.boards.length) throw new Error('Invalid Board store JSON: duplicate Board id');
}
function emptyStore(): BoardStoreDocument { return { schemaVersion: BOARD_STORE_SCHEMA_VERSION, revision: 0, boards: [] }; }

export class JsonBoardStore {
  private initialized = false;
  private operation = Promise.resolve();
  constructor(readonly filePath: string) {}

  async initialize(): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    try { const document = JSON.parse(await readFile(this.filePath, 'utf8')) as unknown; validateStore(document); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; await this.writeAtomic(emptyStore()); }
    this.initialized = true;
  }
  async readBoards(): Promise<Board[]> { this.assertInitialized(); const document = await this.readFromDisk(); return document.boards.map((board) => structuredClone(board)); }
  async transaction<T>(mutator: (boards: Board[]) => { boards: Board[]; result: T }): Promise<T> {
    this.assertInitialized();
    return this.enqueue(() => this.withFileLock(async () => { const current = await this.readFromDisk(); const outcome = mutator(current.boards.map((board) => structuredClone(board))); const next = { schemaVersion: BOARD_STORE_SCHEMA_VERSION, revision: current.revision + 1, boards: outcome.boards } satisfies BoardStoreDocument; validateStore(next); await this.writeAtomic(next); return outcome.result; }));
  }
  private async readFromDisk(): Promise<BoardStoreDocument> { const document = JSON.parse(await readFile(this.filePath, 'utf8')) as unknown; validateStore(document); return document; }
  private async writeAtomic(document: BoardStoreDocument): Promise<void> {
    const temporaryPath = `${this.filePath}.${process.pid}.${randomUUID()}.tmp`;
    const handle = await open(temporaryPath, 'wx');
    try { await handle.writeFile(`${JSON.stringify(document, null, 2)}\n`, 'utf8'); await handle.sync(); } finally { await handle.close(); }
    try { await rename(temporaryPath, this.filePath); } catch (error) { await unlink(temporaryPath).catch(() => undefined); throw error; }
    try { const directory = await open(dirname(this.filePath), 'r'); try { await directory.sync(); } finally { await directory.close(); } } catch { /* directory fsync is unavailable on some platforms; rename remains atomic */ }
  }
  private async withFileLock<T>(operation: () => Promise<T>): Promise<T> {
    const lockPath = `${this.filePath}.lock`; const startedAt = Date.now(); let lockHandle;
    while (!lockHandle) { try { lockHandle = await open(lockPath, 'wx'); await lockHandle.writeFile(`${process.pid}\n`, 'utf8'); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; try { if (Date.now() - (await stat(lockPath)).mtimeMs > LOCK_STALE_MS) await unlink(lockPath); } catch (statError) { if ((statError as NodeJS.ErrnoException).code !== 'ENOENT') throw statError; } if (Date.now() - startedAt >= LOCK_TIMEOUT_MS) throw new Error('Board store is busy; concurrent write protection timed out'); await new Promise((resolve) => setTimeout(resolve, LOCK_RETRY_MS)); } }
    try { return await operation(); } finally { await lockHandle.close(); await unlink(lockPath).catch(() => undefined); }
  }
  private enqueue<T>(operation: () => Promise<T>): Promise<T> { const next = this.operation.then(operation, operation); this.operation = next.then(() => undefined, () => undefined); return next; }
  private assertInitialized(): void { if (!this.initialized) throw new Error('Board store has not been initialized'); }
}
