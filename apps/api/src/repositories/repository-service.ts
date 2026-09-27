import type { GiteaRepository } from "@gitea-portal/gitea-contracts";
import { GiteaClient } from "../gitea/client.js";

export function listRepositories(
  client: GiteaClient,
): Promise<GiteaRepository[]> {
  return client.repositories();
}
