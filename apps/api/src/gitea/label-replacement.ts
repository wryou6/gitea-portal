import type { RepositoryRef } from '@gitea-portal/domain';
import { PortalError } from '../errors.js';
import { GiteaClient } from './client.js';

function labelNames(labels: Array<{ name: string }>): string[] {
  return labels.map((label) => label.name).sort();
}

export async function replaceIssueLabelsAtomically(
  client: GiteaClient,
  repository: RepositoryRef,
  number: number,
  originalUpdatedAt: string,
  currentLabelNames: string[],
  nextLabelIds: number[],
  nextLabelNames: string[],
): Promise<void> {
  const latest = await client.issue(repository, number);
  if (latest.updatedAt !== originalUpdatedAt || labelNames(latest.labels) .join('\u0000') !== labelNames(currentLabelNames.map((name) => ({ name }))).join('\u0000')) {
    throw new PortalError(409, 'Issue changed in Gitea; reload before changing its workflow state');
  }
  await client.replaceIssueLabels(repository, number, nextLabelIds);
  const updated = await client.issue(repository, number);
  if (labelNames(updated.labels).join('\u0000') !== labelNames(nextLabelNames.map((name) => ({ name }))).join('\u0000')) {
    throw new PortalError(409, 'Gitea did not persist the requested workflow labels');
  }
}
