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
  }
  return conventions;
}
