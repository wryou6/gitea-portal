import type { Board, WorkflowConvention } from '@gitea-portal/domain';
import { BoardRepository, type BoardInput } from '../persistence/board-repository.js';
import { validateBoardRepositories } from './board-compatibility.js';

export async function createBoard(repository: BoardRepository, input: BoardInput, conventions: WorkflowConvention[]): Promise<Board> {
  validateBoardRepositories(input, input.repositoryRefs, conventions);
  return repository.create(input);
}
export async function updateBoard(repository: BoardRepository, id: string, input: BoardInput, conventions: WorkflowConvention[]): Promise<Board | undefined> {
  validateBoardRepositories(input, input.repositoryRefs, conventions);
  return repository.update(id, input);
}
