import type { Board, BoardGanttView } from '@gitea-portal/domain';
import { GiteaClient } from '../gitea/client.js';
import { mapIssue } from '../issues/issue-service.js';

export async function getBoardGanttView(client: GiteaClient, board: Board): Promise<BoardGanttView> {
  const issues = [];
  for (const repository of board.repositoryRefs) {
    const repositoryIssues = await client.repositoryIssuesAllPages(repository, { state: 'all', type: 'issues', limit: 100 });
    issues.push(...repositoryIssues.map(mapIssue));
  }
  return { board, issues };
}
