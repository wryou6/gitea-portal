import type { UserProfile } from "@gitea-portal/domain";

export type Comment = { id: number; user: UserProfile; body: string; createdAt: string; updatedAt?: string };
