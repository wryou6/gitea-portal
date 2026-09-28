import {
  STATUS_ACTIONS,
  resolveIssueStatus,
  type RepositoryRef,
} from "@gitea-portal/domain";
import type { GiteaIssue } from "@gitea-portal/gitea-contracts";
import { canAccessRepository } from "../auth/permissions.js";
import { PortalError } from "../errors.js";
import { GiteaClient } from "../gitea/client.js";
import { replaceIssueLabelsAtomically } from "../gitea/label-replacement.js";

const legacyStatusPrefix = "workflow:";
const legacyActionPrefix = "workflow-action:";
const statusPrefix = "status:";
const actionPrefix = "status-action:";
const knownStatuses = new Set(["todo", "in-progress"]);
const knownActions = new Set<string>(STATUS_ACTIONS.map((action) => action.key));

export type StatusLabelMigrationFailure = {
  owner: string;
  repository: string;
  issueNumber?: number;
  reason: string;
};

export type StatusLabelMigrationReport = {
  repositories: number;
  issuesScanned: number;
  migrated: number;
  unchanged: number;
  successfulIssues: Array<{
    owner: string;
    repository: string;
    issueNumber: number;
    outcome: "migrated" | "unchanged";
  }>;
  resolvedConflicts: Array<{
    owner: string;
    repository: string;
    issueNumber: number;
    removedLegacyLabels: string[];
    retainedStatusLabels: string[];
  }>;
  failures: StatusLabelMigrationFailure[];
  verified: boolean;
};

function issueRef(issue: GiteaIssue): RepositoryRef {
  return issue.repository;
}

function key(issue: GiteaIssue): string {
  return `${issue.repository.owner}/${issue.repository.name}#${issue.number}`;
}

function repositoryResult(repository: RepositoryRef) {
  return { owner: repository.owner, repository: repository.name };
}

function isLegacyLabel(name: string): boolean {
  return name.startsWith(legacyStatusPrefix) || name.startsWith(legacyActionPrefix);
}

function isTargetActionLabel(name: string): boolean {
  return name.startsWith(actionPrefix);
}

function targetName(name: string): string | undefined {
  if (name.startsWith(legacyStatusPrefix)) {
    const suffix = name.slice(legacyStatusPrefix.length);
    return knownStatuses.has(suffix) ? `${statusPrefix}${suffix}` : undefined;
  }
  if (name.startsWith(legacyActionPrefix)) {
    const suffix = name.slice(legacyActionPrefix.length);
    return knownActions.has(suffix) ? `${actionPrefix}${suffix}` : undefined;
  }
  return undefined;
}

async function replaceNamesAtomically(
  client: GiteaClient,
  issue: GiteaIssue,
  currentNames: string[],
  nextNames: string[],
): Promise<void> {
  const repository = issueRef(issue);
  for (const name of nextNames) {
    if (name.startsWith(statusPrefix) || name.startsWith(actionPrefix)) {
      await client.ensureLabel(repository, name, "4f46e5", "Portal Issue Status metadata");
    }
  }
  const definitions = await client.labels(repository);
  const ids = new Map(definitions.map((label) => [label.name, label.id]));
  const nextIds = nextNames.map((name) => {
    const id = ids.get(name);
    if (id === undefined) throw new Error(`Gitea label definition is missing: ${name}`);
    return id;
  });
  await replaceIssueLabelsAtomically(
    client,
    repository,
    issue.number,
    issue.updatedAt,
    currentNames,
    nextIds,
    nextNames,
  );
}

async function migrateIssue(
  client: GiteaClient,
  issue: GiteaIssue,
): Promise<"unchanged" | "migrated" | "resolved-conflict"> {
  const currentNames = issue.labels.map((label) => label.name);
  const legacyNames = currentNames.filter(isLegacyLabel);
  if (legacyNames.length === 0) return "unchanged";

  const mappedNames = legacyNames.map((name) => {
    const mapped = targetName(name);
    if (!mapped) throw new PortalError(409, `Unknown legacy Status label on ${key(issue)}: ${name}`);
    return mapped;
  });
  const existingTargetNames = currentNames.filter(
    (name) => name.startsWith(statusPrefix) || name.startsWith(actionPrefix),
  );
  const stateTargets = existingTargetNames.filter((name) => name.startsWith(statusPrefix));
  const actionTargets = existingTargetNames.filter(isTargetActionLabel);
  const stateLegacy = legacyNames.filter((name) => name.startsWith(legacyStatusPrefix));
  const actionLegacy = legacyNames.filter((name) => name.startsWith(legacyActionPrefix));
  const hasDifferentState = stateTargets.length > 0 && stateLegacy.some((name) => !stateTargets.includes(targetName(name) ?? ""));
  const hasDifferentAction = actionTargets.length > 0 && actionLegacy.some((name) => !actionTargets.includes(targetName(name) ?? ""));
  const resolvedConflict = hasDifferentState || hasDifferentAction;
  const mappedState = stateTargets.length > 0 ? [] : mappedNames.filter((name) => name.startsWith(statusPrefix));
  const mappedActions = actionTargets.length > 0 ? [] : mappedNames.filter(isTargetActionLabel);
  const preserved = currentNames.filter((name) => !isLegacyLabel(name));
  const nextNames = [...new Set([...preserved, ...mappedState, ...mappedActions])].sort();

  await replaceNamesAtomically(client, issue, currentNames, nextNames);
  return resolvedConflict ? "resolved-conflict" : "migrated";
}

function validateMigratedIssue(issue: GiteaIssue): string | undefined {
  const labels = issue.labels.map((label) => label.name);
  if (labels.some(isLegacyLabel)) return "Legacy Status labels remain after migration";
  const statusLabels = labels.filter((name) => name.startsWith(statusPrefix));
  const actionLabels = labels.filter(isTargetActionLabel);
  if (actionLabels.some((name) => !knownActions.has(name.slice(actionPrefix.length)))) {
    return "Unknown Status action label";
  }
  const resolved = resolveIssueStatus(issue.state, issue.labels);
  if (resolved.kind !== "status") return `Invalid Issue Status: ${resolved.anomaly}`;
  if (statusLabels.length > 1) return "Multiple Issue Status labels remain";
  return undefined;
}

async function readAllIssues(
  client: GiteaClient,
  repositories: RepositoryRef[],
  failures: StatusLabelMigrationFailure[],
): Promise<GiteaIssue[]> {
  const all: GiteaIssue[] = [];
  for (const repository of repositories) {
    try {
      all.push(...await client.repositoryIssuesAllPages(repository, { state: "all", type: "issues" }));
    } catch (cause) {
      failures.push({
        ...repositoryResult(repository),
        reason: cause instanceof Error ? cause.message : String(cause),
      });
    }
  }
  return all;
}

export async function migrateAllStatusLabels(client: GiteaClient): Promise<StatusLabelMigrationReport> {
  const initialRepositories = (await client.repositories())
    .map(({ owner, name }) => ({ owner, name }))
    .sort((a, b) => `${a.owner}/${a.name}`.localeCompare(`${b.owner}/${b.name}`));
  const failures: StatusLabelMigrationFailure[] = [];
  const issues = await readAllIssues(client, initialRepositories, failures);
  const report: StatusLabelMigrationReport = {
    repositories: initialRepositories.length,
    issuesScanned: issues.length,
    migrated: 0,
    unchanged: 0,
    successfulIssues: [],
    resolvedConflicts: [],
    failures,
    verified: false,
  };

  const writableRepositories = new Set<string>();
  for (const repository of initialRepositories) {
    if (!(await canAccessRepository(client, repository, "update")) ||
        !(await canAccessRepository(client, repository, "labels"))) {
      failures.push({ ...repositoryResult(repository), reason: "Current admin account cannot update Issue labels" });
    } else {
      writableRepositories.add(`${repository.owner}/${repository.name}`);
    }
  }

  // Never start a partial migration: the agreed scope is the complete set of
  // repositories visible to the admin account, and every one must be writable.
  if (failures.length > 0) {
    return report;
  }

  const migratableIssues = issues.filter((issue) => writableRepositories.has(`${issue.repository.owner}/${issue.repository.name}`));
  for (let offset = 0; offset < migratableIssues.length; offset += 4) {
    const batch = migratableIssues.slice(offset, offset + 4);
    const results = await Promise.all(batch.map(async (issue) => {
      try {
        return { issue, result: await migrateIssue(client, issue) };
      } catch (cause) {
        return { issue, error: cause instanceof Error ? cause.message : String(cause) };
      }
    }));
    for (const entry of results) {
      if ("error" in entry) {
        failures.push({ ...repositoryResult(entry.issue.repository), issueNumber: entry.issue.number, reason: entry.error ?? "Unknown Issue migration failure" });
      } else if (entry.result === "unchanged") {
        report.unchanged += 1;
        report.successfulIssues.push({ ...repositoryResult(entry.issue.repository), issueNumber: entry.issue.number, outcome: "unchanged" });
      } else {
        report.migrated += 1;
        report.successfulIssues.push({ ...repositoryResult(entry.issue.repository), issueNumber: entry.issue.number, outcome: "migrated" });
        if (entry.result === "resolved-conflict") {
          const removedLegacyLabels = entry.issue.labels.map((label) => label.name).filter(isLegacyLabel);
          const retainedStatusLabels = entry.issue.labels.map((label) => label.name).filter((name) => name.startsWith(statusPrefix) || name.startsWith(actionPrefix));
          report.resolvedConflicts.push({ ...repositoryResult(entry.issue.repository), issueNumber: entry.issue.number, removedLegacyLabels, retainedStatusLabels });
        }
      }
    }
  }

  const currentRepositories = (await client.repositories())
    .map(({ owner, name }) => ({ owner, name }))
    .sort((a, b) => `${a.owner}/${a.name}`.localeCompare(`${b.owner}/${b.name}`));
  const initialScope = initialRepositories.map((repo) => `${repo.owner}/${repo.name}`).join("\n");
  const currentScope = currentRepositories.map((repo) => `${repo.owner}/${repo.name}`).join("\n");
  if (initialScope !== currentScope) failures.push({ owner: "", repository: "", reason: "Repository scope changed during Status migration; rerun full migration and verification" });

  const verifiedIssues = await readAllIssues(client, currentRepositories, failures);
  let valid = true;
  for (const issue of verifiedIssues) {
    const reason = validateMigratedIssue(issue);
    if (reason) {
      valid = false;
      failures.push({ ...repositoryResult(issue.repository), issueNumber: issue.number, reason });
    }
  }
  report.issuesScanned = verifiedIssues.length;
  report.verified = valid && failures.length === 0 && initialScope === currentScope;
  return report;
}
