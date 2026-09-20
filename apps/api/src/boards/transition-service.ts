import type { Board, RepositoryRef, WorkflowConvention } from '@gitea-portal/domain';
import { PortalError } from '../errors.js';
import { canAccessRepository } from '../auth/permissions.js';
import { GiteaClient } from '../gitea/client.js';
import { replaceIssueLabelsAtomically } from '../gitea/label-replacement.js';

export async function transitionCard(client: GiteaClient, board: Board, convention: WorkflowConvention, repository: RepositoryRef, number: number, stateKey: string) {
  if (!board.repositoryRefs.some((item) => item.owner === repository.owner && item.name === repository.name)) throw new Error('Repository is not part of this Board');
  if (!await canAccessRepository(client, repository, 'labels')) throw new PortalError(403, 'Permission denied');
  const target = convention.states.find((state) => state.key === stateKey);
  if (!target) throw new Error('Workflow state is not defined');
  const issue = await client.issue(repository, number);
  const labels = await client.labels(repository);
  const targetLabel = labels.find((label) => label.name === target.labelName);
  if (!targetLabel) throw new Error('Target Workflow Label does not exist');
  const workflowNames = new Set(convention.states.map((state) => state.labelName));
  const workflowLabels = issue.labels.filter((label) => workflowNames.has(label.name));
  if (workflowLabels.length > 1) throw new PortalError(409, 'Issue has conflicting Workflow Labels; resolve the conflict in Gitea first');
  const preserved = issue.labels.filter((label) => !workflowNames.has(label.name));
  const preservedIds = preserved.map((label) => {
    const match = labels.find((candidate) => candidate.name === label.name);
    if (!match) throw new Error(`Issue Label does not exist in Gitea: ${label.name}`);
    return match.id;
  });
  await replaceIssueLabelsAtomically(client, repository, number, issue.updatedAt, issue.labels.map((label) => label.name), [...preservedIds, targetLabel.id], [...preserved.map((label) => label.name), target.labelName]);
  return client.issue(repository, number);
}
