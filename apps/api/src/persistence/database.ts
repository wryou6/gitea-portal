import type { Board } from '@gitea-portal/domain';

/** Persistence boundary. Issue data never enters this store. */
export class Database {
  readonly boards = new Map<string, Board>();
}
