import fs from 'node:fs/promises';
import yaml from 'js-yaml';
import type { WorkflowConvention } from '@gitea-portal/domain';

type ConfigFile = { conventions: Array<WorkflowConvention & { repositories?: string[] }> };

export async function loadConventions(path: string): Promise<WorkflowConvention[]> {
  const parsed = yaml.load(await fs.readFile(path, 'utf8')) as ConfigFile;
  const conventions = parsed?.conventions ?? [];
  for (const convention of conventions) {
    const keys = new Set(convention.states.map((state) => state.key));
    const labels = new Set(convention.states.map((state) => state.labelName));
    if (keys.size !== convention.states.length || labels.size !== convention.states.length) {
      throw new Error(`Invalid duplicate Workflow state in ${convention.id}@${convention.version}`);
    }
    const orders = convention.states.map((state) => state.order);
    if (new Set(orders).size !== orders.length || orders.some((order) => order < 0) || convention.states.some((state) => !state.key || !state.labelName)) throw new Error(`Invalid Workflow state ordering in ${convention.id}@${convention.version}`);
  }
  const assigned = new Map<string, string>();
  for (const convention of conventions) for (const repository of convention.repositories ?? []) { if (assigned.has(repository)) throw new Error(`Repository assigned to multiple Workflow Conventions: ${repository}`); assigned.set(repository, `${convention.id}@${convention.version}`); }
  return conventions;
}
