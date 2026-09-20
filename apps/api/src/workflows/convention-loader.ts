import fs from 'node:fs/promises';
import yaml from 'js-yaml';
import type { WorkflowConvention } from '@gitea-portal/domain';
import { validateWorkflowConvention } from '@gitea-portal/domain';

type ConfigFile = { conventions: Array<WorkflowConvention & { repositories?: string[] }> };

export async function loadConventions(path: string): Promise<WorkflowConvention[]> {
  const parsed = yaml.load(await fs.readFile(path, 'utf8')) as ConfigFile;
  const conventions = parsed?.conventions ?? [];
  for (const convention of conventions) {
    validateWorkflowConvention(convention);
  }
  const assigned = new Map<string, string>();
  for (const convention of conventions) for (const repository of convention.repositories ?? []) { if (assigned.has(repository)) throw new Error(`Repository assigned to multiple Workflow Conventions: ${repository}`); assigned.set(repository, `${convention.id}@${convention.version}`); }
  return conventions;
}
