import type { Board, BoardView, IssueSummary, RepositoryRef, WorkflowConvention } from '@gitea-portal/domain';
import { getDefaultWorkflowState, resolveWorkflowState } from '@gitea-portal/domain';
import { GiteaError } from '../gitea/errors.js';
import { GiteaClient } from '../gitea/client.js';
import { replaceIssueLabelsAtomically } from '../gitea/label-replacement.js';
import { searchIssuesReadThrough } from '../issues/issue-search-service.js';
import { mapIssue } from '../issues/issue-service.js';
import { PortalError } from '../errors.js';

type RepairErrorCode = NonNullable<IssueSummary['workflowRepair']>['errorCode'];

class WorkflowRepairFailure extends Error {
  constructor(public readonly code: Exclude<RepairErrorCode, undefined>, message: string) {
    super(message);
    this.name = 'WorkflowRepairFailure';
  }
}

type RepairRepositoryContext = {
  labels?: Array<{ id: number; name: string; color: string }>;
  failure?: unknown;
};

function issueWithWorkflowState(issue: IssueSummary, convention: WorkflowConvention): IssueSummary {
  const resolved = resolveWorkflowState(issue.labels, convention);
  return {
    ...issue,
    workflowState: resolved.kind === 'state' ? resolved.key : resolved.kind,
  };
}

function classifyFailure(error: unknown): { code: Exclude<RepairErrorCode, undefined>; message: string } {
  if (error instanceof WorkflowRepairFailure) return { code: error.code, message: error.message };
  if (error instanceof PortalError) {
    if (error.status === 403) return { code: 'permission_denied', message: error.message };
    if (error.status === 409) {
      return error.message.includes('did not persist')
        ? { code: 'persist_failed', message: error.message }
        : { code: 'concurrent_change', message: error.message };
    }
    if (error.status === 422) return { code: 'missing_label', message: error.message };
  }
  if (error instanceof GiteaError) {
    if (error.status === 403 || error.status === 401) return { code: 'permission_denied', message: '目前使用者沒有修改此 Repository Labels 的權限' };
    if (error.status === 409) return { code: 'concurrent_change', message: error.message };
    return { code: 'external_unavailable', message: 'Gitea 暫時無法完成此卡片的狀態修復' };
  }
  return { code: 'unknown', message: error instanceof Error ? error.message : '狀態修復失敗' };
}

function failureAnnotation(sourceState: 'unconfigured' | 'conflict', error: unknown) {
  const failure = classifyFailure(error);
  return {
    outcome: 'failed' as const,
    sourceState,
    errorCode: failure.code,
    message: failure.message,
  };
}

async function currentIssueAfterConcurrentChange(client: GiteaClient, issue: IssueSummary): Promise<IssueSummary> {
  try {
    return mapIssue(await client.issue({ owner: issue.owner, name: issue.name }, issue.number));
  } catch {
    return issue;
  }
}

async function repairCard(
  client: GiteaClient,
  issue: IssueSummary,
  convention: WorkflowConvention,
  repositoryContext: Promise<RepairRepositoryContext>,
): Promise<IssueSummary> {
  const resolved = resolveWorkflowState(issue.labels, convention);
  if (resolved.kind === 'state') return { ...issue, workflowState: resolved.key };

  const sourceState = resolved.kind;
  try {
    const context = await repositoryContext;
    if (context.failure) throw context.failure;
    const labels = context.labels ?? [];
    const target = labels.find((label) => label.name === getDefaultWorkflowState(convention).labelName);
    if (!target) throw new WorkflowRepairFailure('missing_label', 'Workflow 預設 Label 不存在於 Repository');

    const workflowNames = new Set(convention.states.map((state) => state.labelName));
    const preserved = issue.labels.filter((label) => !workflowNames.has(label.name));
    const preservedIds = preserved.map((label) => {
      const repositoryLabel = labels.find((candidate) => candidate.name === label.name);
      if (!repositoryLabel) throw new WorkflowRepairFailure('missing_label', `Issue Label 不存在於 Repository: ${label.name}`);
      return repositoryLabel.id;
    });
    await replaceIssueLabelsAtomically(
      client,
      { owner: issue.owner, name: issue.name },
      issue.number,
      issue.updatedAt,
      issue.labels.map((label) => label.name),
      [...preservedIds, target.id],
      [...preserved.map((label) => label.name), target.name],
    );
    const refreshed = mapIssue(await client.issue({ owner: issue.owner, name: issue.name }, issue.number));
    return {
      ...issueWithWorkflowState(refreshed, convention),
      workflowRepair: { outcome: 'repaired', sourceState },
    };
  } catch (error) {
    const failure = classifyFailure(error);
    const current = failure.code === 'concurrent_change' ? await currentIssueAfterConcurrentChange(client, issue) : issue;
    return {
      ...issueWithWorkflowState(current, convention),
      workflowRepair: failureAnnotation(sourceState, error),
    };
  }
}

export async function getBoardView(client: GiteaClient, board: Board, convention: WorkflowConvention): Promise<BoardView> {
  const results = await Promise.all(board.repositoryRefs.map((repository) => searchIssuesReadThrough(client, {
    repository: `${repository.owner}/${repository.name}`,
    state: 'all',
    page: 1,
    limit: 100,
  })));
  const cards = results.flatMap((result) => result.items);
  const contextByRepository = new Map<string, Promise<RepairRepositoryContext>>();
  const contextFor = (repository: RepositoryRef): Promise<RepairRepositoryContext> => {
    const key = `${repository.owner}/${repository.name}`;
    const existing = contextByRepository.get(key);
    if (existing) return existing;
    const context = (async (): Promise<RepairRepositoryContext> => {
      try {
        const permission = await client.repositoryPermission(repository);
        if (!permission.push) throw new WorkflowRepairFailure('permission_denied', '目前使用者沒有修改此 Repository Labels 的權限');
        return { labels: await client.labels(repository) };
      } catch (failure) {
        return { failure };
      }
    })();
    contextByRepository.set(key, context);
    return context;
  };

  const repairedCards = await Promise.all(cards.map((issue) => repairCard(
    client,
    issue,
    convention,
    contextFor({ owner: issue.owner, name: issue.name }),
  )));
  const normalColumns = convention.states
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((state) => ({
      stateKey: state.key,
      displayName: state.displayName,
      cards: repairedCards.filter((card) => card.workflowState === state.key),
    }));
  const anomalyColumns = [
    { stateKey: 'unconfigured', displayName: '未設定狀態', cards: repairedCards.filter((card) => card.workflowState === 'unconfigured') },
    { stateKey: 'conflict', displayName: '狀態衝突', cards: repairedCards.filter((card) => card.workflowState === 'conflict') },
  ].filter((column) => column.cards.length > 0);
  return { board, columns: [...anomalyColumns, ...normalColumns] };
}
