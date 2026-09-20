import { IssueDetailPage } from './IssueDetailPage';
export function IssueDetailRoute({ owner, repo, number }: { owner: string; repo: string; number: number }) { return <IssueDetailPage owner={owner} repo={repo} number={number} />; }
