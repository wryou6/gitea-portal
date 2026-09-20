import type { RepositoryRef } from '@gitea-portal/domain';
import { GiteaClient } from '../gitea/client.js';

export type PermissionOperation = 'read' | 'create' | 'update' | 'comment' | 'labels';

export async function canAccessRepository(client: GiteaClient, repository: RepositoryRef, operation: PermissionOperation): Promise<boolean> {
  try {
    const permission = await client.repositoryPermission(repository);
    if (operation === 'read') return Boolean(permission.pull);
    if (operation === 'create' || operation === 'comment' || operation === 'update' || operation === 'labels') return Boolean(permission.push);
    return false;
  } catch { return false; }
}
