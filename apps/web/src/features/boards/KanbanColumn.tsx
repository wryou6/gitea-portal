import type { Issue } from '../../lib/api';
import { KanbanCard } from './KanbanCard';
export function KanbanColumn({ column, dragged, onDragStart, onDropCard }: { column: { stateKey: string; displayName: string; cards: Issue[] }; dragged?: Issue; onDragStart: (issue: Issue) => void; onDropCard: (issue: Issue, stateKey: string) => void }) {
  const canDrop = column.stateKey !== 'unconfigured' && column.stateKey !== 'conflict';
  return <section
    className={`kanban-column${canDrop ? '' : ' anomaly-column'}`}
    onDragOver={(event) => { if (canDrop) event.preventDefault(); }}
    onDrop={() => { if (canDrop && dragged) onDropCard(dragged, column.stateKey); }}
  >
    <h2>{column.displayName}<span>{column.cards.length}</span></h2>
    {column.cards.map((issue) => <div key={`${issue.owner}/${issue.name}#${issue.number}`}><KanbanCard issue={issue} onDragStart={onDragStart} /></div>)}
  </section>;
}
