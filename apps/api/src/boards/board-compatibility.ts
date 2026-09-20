import type { Board, RepositoryRef, WorkflowConvention } from '@gitea-portal/domain';

export function validateBoardRepositories(board: Pick<Board, 'workflowConventionId' | 'workflowConventionVersion' | 'repositoryRefs'>, repositories: RepositoryRef[], conventions: WorkflowConvention[]): void {
  const convention = conventions.find((item) => item.id === board.workflowConventionId && item.version === board.workflowConventionVersion);
  if (!convention) throw new Error('Workflow Convention version is unavailable');
  const allowed = new Set((convention as WorkflowConvention & { repositories?: string[] }).repositories ?? []);
  for (const repository of repositories) {
    if (!allowed.has(`${repository.owner}/${repository.name}`)) throw new Error(`Repository ${repository.owner}/${repository.name} is not compatible with this Workflow Convention`);
  }
}
