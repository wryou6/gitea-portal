import type { BoardCard } from "./types";
import { Badge } from "../../components/ui/Badge";
import { IssueTypeBadge } from "../../components/ui/IssueTypeBadge";
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
  const repair = issue.workflowRepair;
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
      </div>
      <small>
        {issue.owner}/{issue.name} #{issue.number}
      </small>
      <small>{issue.assignee ?? "未指派"}</small>
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
      {repair?.outcome === "repaired" && (
        <small className="repair-success" role="status">
          已自動修復 Workflow 狀態
        </small>
      )}
      {repair?.outcome === "failed" && (
        <div className="repair-failure" role="alert">
          <strong>Workflow 狀態修復失敗</strong>
          <small>
            {repair.errorCode}: {repair.message}
          </small>
          <small>可拖曳至有效狀態欄位重試</small>
        </div>
      )}
    </article>
  );
}
