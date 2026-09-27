import type { BoardCard } from "./types";
import { Badge } from "../../components/ui/Badge";
import { IssueTypeBadge } from "../../components/ui/IssueTypeBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { routePaths } from "../../app/routes";
import {
  ScheduleDates,
  scheduleAnomalyTranslationKey,
} from "../issues/ScheduleDates";
import { visibleIssueLabels } from "../issues/issueLabelPresentation";
import { useTranslation } from "react-i18next";
import { workflowNextActionTranslationKey } from "../../i18n/workflow";
import { workflowStateTranslationKey } from "../../i18n/workflow";
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
  const { t } = useTranslation("boards");
  const { t: tIssues } = useTranslation("issues");
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
      <small>{t("currentAssignee")}: {issue.currentOwner ?? t("noAssignee")}</small>
      <ScheduleDates
        startDate={issue.startDate}
        dueDate={issue.dueDate}
        scheduleAnomaly={issue.scheduleAnomaly}
        className="schedule-dates--compact"
      />
      {issue.scheduleStatus === "invalid" && (
        <small className="schedule-anomaly" role="status">
          {tIssues(scheduleAnomalyTranslationKey(issue.scheduleAnomaly))}
        </small>
      )}
      {visibleLabels.length > 0 && (
        <div className="labels" aria-label={t("labels")}>
          {visibleLabels.map((label) => (
            <Badge key={label.name}>{label.name}</Badge>
          ))}
        </div>
      )}
      <label className="field">
        <span className="muted">{t("moveToStatus")}</span>
        <select
          aria-label={t("moveIssueToStatus", { title: issue.title })}
          value=""
          onChange={(event) => {
            if (event.target.value) onMove(issue, event.target.value);
          }}
        >
          <option value="">{t("selectColumn")}</option>
          {destinations.map((destination) => (
            <option key={destination.stateKey} value={destination.stateKey}>
              {tIssues(workflowStateTranslationKey(destination.stateKey))}
            </option>
          ))}
        </select>
      </label>
      <small className="kanban-next-action">{t("nextAction", { action: tIssues(workflowNextActionTranslationKey(issue.nextActionKey), { ns: "issues" }) })}</small>
    </article>
  );
}
