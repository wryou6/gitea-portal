import type { Board, RepositoryRef, WorkflowConvention } from '@gitea-portal/domain';
import { GiteaClient } from '../gitea/client.js';

export async function transitionCard(client: GiteaClient, board: Board, convention: WorkflowConvention, repository: RepositoryRef, number: number, stateKey: string) {
  if (!board.repositoryRefs.some((item) => item.owner === repository.owner && item.name === repository.name)) throw new Error('Repository is not part of this Board');
  const target = convention.states.find((state) => state.key === stateKey);
  if (!target) throw new Error('Workflow state is not defined');
  const issue = await client.issue(repository, number);
  const labels = await client.labels(repository);
  const targetLabel = labels.find((label) => label.name === target.labelName);
  if (!targetLabel) throw new Error('Target Workflow Label does not exist');
  const workflowNames = new Set(convention.states.map((state) => state.labelName));
  const preservedIds = issue.labels.filter((label) => !workflowNames.has(label.name)).map((label) => labels.find((candidate) => candidate.name === label.name)?.id).filter((id): id is number => id !== undefined);
  await client.replaceIssueLabels(repository, number, [...preservedIds, targetLabel.id]);
  return client.issue(repository, number);
}
