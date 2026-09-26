export type RepositoryRef = { owner: string; name: string };

export type RepositoryWorkspace = RepositoryRef & {
  fullName: string;
  conventionId: string | null;
  conventionVersion: string | null;
};

export type WorkspaceView = "issues" | "kanban" | "gantt";

export const repositoryKey = (repository: RepositoryRef): string =>
  `${repository.owner}/${repository.name}`;
