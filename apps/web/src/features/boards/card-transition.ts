import { api } from "../../lib/api";
import type { Issue } from "../../lib/api";
export function transitionCard(
  boardId: string,
  issue: Issue,
  stateKey: string,
) {
  return api(
    `/api/boards/${boardId}/cards/${issue.owner}/${issue.name}/${issue.number}/transition`,
    { method: "POST", body: JSON.stringify({ stateKey }) },
  );
}
