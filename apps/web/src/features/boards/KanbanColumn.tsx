import { KanbanCard } from "./KanbanCard";
import type { BoardCard } from "./types";
export function KanbanColumn({
  column,
  destinations,
  dragged,
  onDragStart,
  onDropCard,
}: {
  column: { stateKey: string; displayName: string; cards: BoardCard[] };
  destinations: Array<{ stateKey: string; displayName: string }>;
  dragged?: BoardCard;
  onDragStart: (issue: BoardCard) => void;
  onDropCard: (issue: BoardCard, stateKey: string) => void;
}) {
  const canDrop =
    column.stateKey !== "unconfigured" && column.stateKey !== "conflict";
  return (
    <section
      className={`kanban-column${canDrop ? "" : " anomaly-column"}`}
      onDragOver={(event) => {
        if (canDrop) event.preventDefault();
      }}
      onDrop={() => {
        if (canDrop && dragged) onDropCard(dragged, column.stateKey);
      }}
    >
      <h2>
        {column.displayName}
        <span>{column.cards.length}</span>
      </h2>
      {column.cards.map((issue) => (
        <div key={`${issue.owner}/${issue.name}#${issue.number}`}>
          <KanbanCard
            issue={issue}
            destinations={destinations.filter(
              (destination) => destination.stateKey !== column.stateKey,
            )}
            onMove={onDropCard}
            onDragStart={onDragStart}
          />
        </div>
      ))}
    </section>
  );
}
