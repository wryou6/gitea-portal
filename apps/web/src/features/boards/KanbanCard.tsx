import type { Issue } from '../../lib/api';
export function KanbanCard({ issue, onDragStart }: { issue: Issue; onDragStart: (issue: Issue) => void }) {
  const repair = issue.workflowRepair;
  return <article className="kanban-card" draggable onDragStart={() => onDragStart(issue)}>
    <a href={`/issue/${issue.owner}/${issue.name}/${issue.number}`}>{issue.title}</a>
    <small>{issue.owner}/{issue.name} #{issue.number}</small>
    <small>{issue.assignee ?? '未指派'}</small>
    <div className="labels">{issue.labels.map((label) => <span className="label" key={label.name}>{label.name}</span>)}</div>
    {repair?.outcome === 'repaired' && <small className="repair-success" role="status">已自動修復 Workflow 狀態</small>}
    {repair?.outcome === 'failed' && <div className="repair-failure" role="alert"><strong>Workflow 狀態修復失敗</strong><small>{repair.errorCode}: {repair.message}</small><small>可拖曳至有效狀態欄位重試</small></div>}
  </article>;
}
