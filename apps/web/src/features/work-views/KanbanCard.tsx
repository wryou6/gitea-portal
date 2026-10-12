import type { WorkViewCard } from "./types";
import { Link } from "react-router";
import { IssueTypeBadge } from "../../components/ui/IssueTypeBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { issueDetailMask } from "../../app/routes";
import {
  ScheduleDates,
  scheduleAnomalyTranslationKey,
} from "../issues/ScheduleDates";
import { useTranslation } from "react-i18next";
import { statusNextActionTranslationKey } from "../../i18n/status";
import { AssigneeIdentityGroup } from "../../components/ui/AssigneeIdentityGroup";
import { assigneeLoginsForDisplay } from "../../lib/assignee-display";
import { profileFor } from "../../lib/user-profiles";
import { isIssueOverdue } from "../issues/overdue-date";
import { IssueMetadataBadgeEditor } from "../issues/IssueMetadataBadgeEditor";

export function KanbanCard({
  issue,
  onDragStart,
  canDrag = true,
  returnTo,
  onMetadataSave,
}: {
  issue: WorkViewCard;
  onDragStart: (issue: WorkViewCard) => void;
  canDrag?: boolean;
  returnTo?: string;
  onMetadataSave?: (issue: WorkViewCard, field: "type" | "priority", value: string) => Promise<void>;
}) {
  const { t } = useTranslation("work-views");
  const { t: tIssues } = useTranslation("issues");
  const isDone = issue.status === "done";
  const assigneeUsers = assigneeLoginsForDisplay(issue).map((login) =>
    profileFor(issue.userProfiles, login),
  );
  return (
    <article
      className="kanban-card"
      draggable={canDrag}
      onDragStart={(event) => {
        if (event.target instanceof HTMLElement && event.target.closest(".issue-metadata-editor")) {
          event.preventDefault();
          return;
        }
        if (canDrag) onDragStart(issue);
      }}
    >
      <div className="kanban-card-meta">
        <div className="kanban-card-type">
          {onMetadataSave ? (
            <IssueMetadataBadgeEditor field="priority" value={issue.priority} onSave={(value) => onMetadataSave(issue, "priority", value)}>
              <PriorityBadge priority={issue.priority} labels={issue.labels} />
            </IssueMetadataBadgeEditor>
          ) : <PriorityBadge priority={issue.priority} labels={issue.labels} />}
          {onMetadataSave ? (
            <IssueMetadataBadgeEditor field="type" value={issue.type} onSave={(value) => onMetadataSave(issue, "type", value)}>
              <IssueTypeBadge type={issue.type} labels={issue.labels} />
            </IssueMetadataBadgeEditor>
          ) : <IssueTypeBadge type={issue.type} labels={issue.labels} />}
        </div>
        <small className="kanban-card-key">
          {issue.owner}/{issue.name} #{issue.number}
        </small>
      </div>
      <div className="kanban-card-title-row">
        <Link
          className="kanban-card-title"
          to={returnTo ?? "/kanban"}
          replace={false}
          mask={issueDetailMask(issue.owner, issue.name, issue.number, returnTo)}
          title={issue.title}
        >
          {issue.title}
        </Link>
      </div>
      <div className="kanban-card-footer">
        <small className="kanban-card-assignee">
          <AssigneeIdentityGroup
            users={assigneeUsers}
            emptyLabel={isDone ? t("noLastAssignee") : t("noAssignee")}
          />
        </small>
        <div className="kanban-card-footer-meta">
          <ScheduleDates
            startDate={issue.startDate}
            dueDate={issue.dueDate}
            scheduleAnomaly={issue.scheduleAnomaly}
            className="schedule-dates--compact kanban-card-due"
            dueOnly
            overdue={isIssueOverdue(issue)}
          />
          <dl className="schedule-dates schedule-dates--compact kanban-next-action">
            <div className="schedule-date">
              <dt>{t("nextActionLabel")}</dt>
              <dd>
                {tIssues(statusNextActionTranslationKey(issue.nextActionKey), {
                  ns: "issues",
                })}
              </dd>
            </div>
          </dl>
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
