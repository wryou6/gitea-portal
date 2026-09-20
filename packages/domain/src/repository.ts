export type RepositoryRef = { owner: string; name: string };

export const repositoryKey = (repository: RepositoryRef): string =>
  `${repository.owner}/${repository.name}`;
