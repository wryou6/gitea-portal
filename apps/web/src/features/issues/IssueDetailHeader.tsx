import type { Issue } from "../../lib/api";
import { LabelList } from "./LabelList";
import { Badge } from "../../components/ui/Badge";
import { IssueTypeBadge } from "../../components/ui/IssueTypeBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { ScheduleDates, scheduleAnomalyTranslationKey } from "./ScheduleDates";
import { WORKFLOW_ACTIONS } from "@gitea-portal/domain";
import { IssueAssigneeRoster } from "./IssueAssigneeRoster";
import { useTranslation } from "react-i18next";
import {
  workflowNextActionTranslationKey,
  workflowReasonTranslationKey,
  workflowStateTranslationKey,
} from "../../i18n/workflow";
import { formatDateTime } from "../../i18n/format";
export function IssueDetailHeader({ issue }: { issue: Issue }) {
  const { t, i18n } = useTranslation("issues");
  const action = WORKFLOW_ACTIONS.find(
    (candidate) => candidate.key === issue.lastActionKey,
  );
  return (
    <>
      <p className="eyebrow">
        {issue.owner}/{issue.name} #{issue.number}
      </p>
      <h1>{issue.title}</h1>
      <div className="issue-detail-type">
        <IssueTypeBadge type={issue.type} labels={issue.labels} />
        <PriorityBadge priority={issue.priority} labels={issue.labels} />
      </div>
      <div className="meta">
        <Badge className={`workflow-status--${issue.workflowState}`}>
          {t(workflowStateTranslationKey(issue.workflowState))}
        </Badge>
        <span>{t("nextAction", { action: t(workflowNextActionTranslationKey(issue.nextActionKey)) })}</span>
        {action && <span>{t("lastReason")}：{t(workflowReasonTranslationKey(action.key))}</span>}
        <ScheduleDates
          startDate={issue.startDate}
          dueDate={issue.dueDate}
          scheduleAnomaly={issue.scheduleAnomaly}
          className="schedule-dates--compact"
        />
        <span>{t("milestone")}：{issue.milestone ?? t("notSet")}</span>
        <time dateTime={issue.updatedAt}>
          {t("updatedAt", {
            date: formatDateTime(issue.updatedAt, i18n.language),
          })}
        </time>
      </div>
      {issue.scheduleStatus === "invalid" && (
        <p className="schedule-anomaly" role="status">
          {t(scheduleAnomalyTranslationKey(issue.scheduleAnomaly))}
        </p>
      )}
      <IssueAssigneeRoster issue={issue} />
      <LabelList labels={issue.labels} />
    </>
  );
}
