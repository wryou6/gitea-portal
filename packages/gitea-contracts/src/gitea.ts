import type {
  IssueLabel,
  IssueSchedule,
  IssueState,
  RepositoryRef,
  UserProfile,
} from "@gitea-portal/domain";

export type GiteaRepository = RepositoryRef & {
  fullName: string;
  htmlUrl: string;
};
export type GiteaUser = UserProfile;
export type GiteaIssue = IssueSchedule & {
  repository: RepositoryRef;
  number: number;
  title: string;
  body: string;
  author: GiteaUser | null;
  state: IssueState;
  assignee: GiteaUser | null;
  assignees: GiteaUser[];
  labels: IssueLabel[];
  milestone: { id: number; title: string } | null;
  closedAt: string | null;
  createdAt: string;
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
