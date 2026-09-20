import type { Issue } from '../../lib/api';
import { LabelList } from './LabelList';
export function IssueDetailHeader({ issue }: { issue: Issue }) { return <><p className="eyebrow">{issue.owner}/{issue.name} #{issue.number}</p><h1>{issue.title}</h1><p>{issue.state === 'open' ? 'Open' : 'Closed'} · {issue.assignee ?? '未指派'} · {issue.milestone ?? '未設定 Milestone'}</p><LabelList labels={issue.labels} /></>; }
