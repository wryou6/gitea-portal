import { KanbanCard } from "./KanbanCard";
import type { WorkViewCard } from "./types";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../i18n/format";
import { issueStatusTranslationKey } from "../../i18n/status";
export function KanbanColumn({
  column,
  dragged,
  onDragStart,
  onDropCard,
  returnTo,
}: {
  column: { stateKey: string; displayName: string; cards: WorkViewCard[] };
  dragged?: WorkViewCard;
  onDragStart: (issue: WorkViewCard) => void;
  onDropCard: (issue: WorkViewCard, stateKey: string) => void;
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
        <span className="kanban-column-title">
          {t(issueStatusTranslationKey(column.stateKey))}
        </span>
        <span className="kanban-column-count">
          {formatNumber(column.cards.length, i18n.language)}
        </span>
      </h2>
      {column.cards.map((issue) => (
        <div key={`${issue.owner}/${issue.name}#${issue.number}`}>
          <KanbanCard
            issue={issue}
            canDrag={canDrop}
            onDragStart={onDragStart}
            returnTo={returnTo}
          />
        </div>
      ))}
      {column.cards.length === 0 && <p className="muted">{t("noMatchingIssues")}</p>}
    </section>
  );
}
