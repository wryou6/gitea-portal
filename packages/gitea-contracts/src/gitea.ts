import type {
  IssueLabel,
  IssueSchedule,
  IssueState,
  RepositoryRef,
} from "@gitea-portal/domain";

export type GiteaRepository = RepositoryRef & {
  fullName: string;
  htmlUrl: string;
};
export type GiteaUser = { login: string; fullName?: string };
export type GiteaIssue = IssueSchedule & {
  repository: RepositoryRef;
  number: number;
  title: string;
  body: string;
  state: IssueState;
  assignee: GiteaUser | null;
  assignees: GiteaUser[];
  labels: IssueLabel[];
  milestone: { id: number; title: string } | null;
  updatedAt: string;
  htmlUrl: string;
};
export type GiteaComment = {
  id: number;
  user: GiteaUser;
  body: string;
  createdAt: string;
  updatedAt?: string;
};
