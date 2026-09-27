import type { BoardCard } from "./types";
import { Badge } from "../../components/ui/Badge";
import { IssueTypeBadge } from "../../components/ui/IssueTypeBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { routePaths } from "../../app/routes";
import { ScheduleDates, scheduleAnomalyMessage } from "../issues/ScheduleDates";
import { visibleIssueLabels } from "../issues/issueLabelPresentation";
export function KanbanCard({
  issue,
  onDragStart,
  destinations,
  onMove,
  returnTo,
}: {
  issue: BoardCard;
  onDragStart: (issue: BoardCard) => void;
  destinations: Array<{ stateKey: string; displayName: string }>;
  onMove: (issue: BoardCard, stateKey: string) => void;
  returnTo?: string;
}) {
  const visibleLabels = visibleIssueLabels(issue.visibleLabels);
  return (
    <article
      className="kanban-card"
      draggable
      onDragStart={() => onDragStart(issue)}
    >
      <a
        href={
          returnTo
            ? routePaths.issueDetailFrom(
                issue.owner,
                issue.name,
                issue.number,
                returnTo,
              )
            : routePaths.issueDetail(issue.owner, issue.name, issue.number)
        }
      >
        {issue.title}
      </a>
      <div className="kanban-card-type">
        <IssueTypeBadge type={issue.type} labels={issue.labels} />
        <PriorityBadge priority={issue.priority} labels={issue.labels} />
      </div>
      <small>
        {issue.owner}/{issue.name} #{issue.number}
      </small>
      <small>負責人：{issue.currentOwner ?? "無"}</small>
      <ScheduleDates
        startDate={issue.startDate}
        dueDate={issue.dueDate}
        scheduleAnomaly={issue.scheduleAnomaly}
        className="schedule-dates--compact"
      />
      {issue.scheduleStatus === "invalid" && (
        <small className="schedule-anomaly" role="status">
          {scheduleAnomalyMessage(issue.scheduleAnomaly)}
        </small>
      )}
      {visibleLabels.length > 0 && (
        <div className="labels" aria-label="Labels">
          {visibleLabels.map((label) => (
            <Badge key={label.name}>{label.name}</Badge>
          ))}
        </div>
      )}
      <label className="field">
        <span className="muted">移動至狀態</span>
        <select
          aria-label={`移動 ${issue.title} 至狀態`}
          value=""
          onChange={(event) => {
            if (event.target.value) onMove(issue, event.target.value);
          }}
        >
          <option value="">選擇欄位</option>
          {destinations.map((destination) => (
            <option key={destination.stateKey} value={destination.stateKey}>
              {destination.displayName}
            </option>
          ))}
        </select>
      </label>
      <small className="kanban-next-action">下一步：{issue.nextAction}</small>
    </article>
  );
}
