import type { Board, BoardView, WorkflowConvention } from '@gitea-portal/domain';
import { resolveWorkflowState } from '@gitea-portal/domain';
import { GiteaClient } from '../gitea/client.js';
import { searchIssuesReadThrough } from '../issues/issue-search-service.js';

export async function getBoardView(client: GiteaClient, board: Board, convention: WorkflowConvention): Promise<BoardView> {
  const results = await Promise.all(board.repositoryRefs.map((repository) => searchIssuesReadThrough(client, { repository: `${repository.owner}/${repository.name}`, state: 'all', page: 1, limit: 100 })));
  const cards = results.flatMap((result) => result.items).map((issue) => ({ ...issue, workflowState: resolveWorkflowState(issue.labels, convention).kind === 'state' ? (resolveWorkflowState(issue.labels, convention) as { key: string }).key : resolveWorkflowState(issue.labels, convention).kind }));
  const columns = [{ stateKey: 'unconfigured', displayName: '未設定狀態', cards: cards.filter((card) => card.workflowState === 'unconfigured') }, { stateKey: 'conflict', displayName: '狀態衝突', cards: cards.filter((card) => card.workflowState === 'conflict') }, ...convention.states.sort((a, b) => a.order - b.order).map((state) => ({ stateKey: state.key, displayName: state.displayName, cards: cards.filter((card) => card.workflowState === state.key) }))];
  return { board, columns };
}
