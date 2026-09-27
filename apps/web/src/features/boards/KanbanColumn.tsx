import { KanbanCard } from "./KanbanCard";
import type { BoardCard } from "./types";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../i18n/format";
import { workflowStateTranslationKey } from "../../i18n/workflow";
export function KanbanColumn({
  column,
  destinations,
  dragged,
  onDragStart,
  onDropCard,
  returnTo,
}: {
  column: { stateKey: string; displayName: string; cards: BoardCard[] };
  destinations: Array<{ stateKey: string; displayName: string }>;
  dragged?: BoardCard;
  onDragStart: (issue: BoardCard) => void;
  onDropCard: (issue: BoardCard, stateKey: string) => void;
  returnTo?: string;
}) {
  const { t, i18n } = useTranslation("issues");
  const canDrop = column.stateKey !== "anomaly";
  return (
    <section
      className={`kanban-column kanban-column--${column.stateKey}${canDrop ? "" : " anomaly-column"}`}
      onDragOver={(event) => {
        if (canDrop) event.preventDefault();
      }}
      onDrop={() => {
        if (canDrop && dragged) onDropCard(dragged, column.stateKey);
      }}
    >
      <h2>
        {t(workflowStateTranslationKey(column.stateKey))}
        <span>{formatNumber(column.cards.length, i18n.language)}</span>
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
            returnTo={returnTo}
          />
        </div>
      ))}
    </section>
  );
}
