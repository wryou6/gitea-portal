import type { Issue } from "../../lib/api";
import { LabelList } from "./LabelList";
import { routePaths } from "../../app/routes";
import { IssueTypeBadge } from "../../components/ui/IssueTypeBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { ScheduleDates, scheduleAnomalyTranslationKey } from "./ScheduleDates";
import { useTranslation } from "react-i18next";
import {
  workflowNextActionTranslationKey,
  workflowStateTranslationKey,
} from "../../i18n/workflow";
import { formatDateTime } from "../../i18n/format";

export function IssueRow({
  issue,
  returnTo,
}: {
  issue: Issue;
  returnTo?: string;
}) {
  const { t, i18n } = useTranslation("issues");
  return (
    <article className={`issue-row issue-row--${issue.workflowState}`}>
      <div className="issue-row-content">
        <div className="issue-heading">
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
            className="issue-title"
          >
            {issue.title}
          </a>
          <IssueTypeBadge type={issue.type} labels={issue.labels} />
          <PriorityBadge priority={issue.priority} labels={issue.labels} />
        </div>
        <div className="meta">
          <span>
            {issue.owner}/{issue.name} #{issue.number}
          </span>
          <span
            className={`workflow-status workflow-status--${issue.workflowState}`}
          >
            {t(workflowStateTranslationKey(issue.workflowState))}
          </span>
          <span>{t("currentAssignee")}：{issue.currentOwner ?? t("notAssigned")}</span>
          <span>{t("nextAction", { action: t(workflowNextActionTranslationKey(issue.nextActionKey)) })}</span>
          <ScheduleDates
            startDate={issue.startDate}
            dueDate={issue.dueDate}
            scheduleAnomaly={issue.scheduleAnomaly}
            className="schedule-dates--compact"
          />
          <span>{issue.milestone ?? t("notSet")}</span>
          {issue.scheduleStatus === "invalid" && (
            <span className="schedule-anomaly" role="status">
              {t(scheduleAnomalyTranslationKey(issue.scheduleAnomaly))}
            </span>
          )}
          <time dateTime={issue.updatedAt}>
            {formatDateTime(issue.updatedAt, i18n.language)}
          </time>
        </div>
      </div>
      <LabelList labels={issue.labels} />
    </article>
  );
}
