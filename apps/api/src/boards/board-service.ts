import type { Board } from "@gitea-portal/domain";
import {
  BoardRepository,
  type BoardInput,
} from "../persistence/board-repository.js";
import { validateBoardRepositories } from "./board-compatibility.js";

export async function createBoard(
  repository: BoardRepository,
  input: BoardInput,
): Promise<Board> {
  validateBoardRepositories(input, input.repositoryRefs);
  return repository.create(input);
}

export async function updateBoard(
  repository: BoardRepository,
  id: string,
  input: BoardInput,
): Promise<Board | undefined> {
  validateBoardRepositories(input, input.repositoryRefs);
  return repository.update(id, input);
}
