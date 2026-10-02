import type { WorkViewCard } from "./types";
import { IssueTypeBadge } from "../../components/ui/IssueTypeBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { routePaths } from "../../app/routes";
import {
  ScheduleDates,
  scheduleAnomalyTranslationKey,
} from "../issues/ScheduleDates";
import { useTranslation } from "react-i18next";
import { statusNextActionTranslationKey } from "../../i18n/status";
import { UserIdentity } from "../../components/ui/UserIdentity";
import { profileFor } from "../../lib/user-profiles";

export function KanbanCard({
  issue,
  onDragStart,
  canDrag = true,
  returnTo,
}: {
  issue: WorkViewCard;
  onDragStart: (issue: WorkViewCard) => void;
  canDrag?: boolean;
  returnTo?: string;
}) {
  const { t } = useTranslation("work-views");
  const { t: tIssues } = useTranslation("issues");
  const isDone = issue.status === "done";
  const assigneeLabel = isDone ? t("lastAssignee") : t("currentAssignee");
  const assignee = isDone ? issue.assignees[0] : issue.currentOwner;
  return (
    <article
      className="kanban-card"
      draggable={canDrag}
      onDragStart={() => {
        if (canDrag) onDragStart(issue);
      }}
    >
      <div className="kanban-card-meta">
        <div className="kanban-card-type">
          <PriorityBadge priority={issue.priority} labels={issue.labels} />
          <IssueTypeBadge type={issue.type} labels={issue.labels} />
        </div>
        <small className="kanban-card-key">
          {issue.owner}/{issue.name} #{issue.number}
        </small>
      </div>
      <div className="kanban-card-title-row">
        <a
          className="kanban-card-title"
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
          title={issue.title}
        >
          {issue.title}
        </a>
        <small className="kanban-next-action">
          {t("nextAction", {
            action: tIssues(statusNextActionTranslationKey(issue.nextActionKey), {
              ns: "issues",
            }),
          })}
        </small>
      </div>
      <div className="kanban-card-footer">
        <div className="kanban-card-assignee-due">
          <small className="kanban-card-assignee">
            {assigneeLabel}: {assignee ? <UserIdentity user={profileFor(issue.userProfiles, assignee)} /> : (isDone ? t("noLastAssignee") : t("noAssignee"))}
          </small>
          <ScheduleDates
            startDate={issue.startDate}
            dueDate={issue.dueDate}
            scheduleAnomaly={issue.scheduleAnomaly}
            className="schedule-dates--compact kanban-card-due"
            dueOnly
          />
        </div>
      </div>
      {issue.scheduleStatus === "invalid" && (
        <small className="schedule-anomaly" role="status">
          {tIssues(scheduleAnomalyTranslationKey(issue.scheduleAnomaly))}
        </small>
      )}
    </article>
  );
}
