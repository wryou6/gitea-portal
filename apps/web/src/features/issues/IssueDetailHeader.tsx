import type { Issue } from "../../lib/api";
import { LabelList } from "./LabelList";
import { IssueTypeBadge } from "../../components/ui/IssueTypeBadge";
import { IssueStatusBadge } from "../../components/ui/IssueStatusBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { ScheduleDates, scheduleAnomalyTranslationKey } from "./ScheduleDates";
import { STATUS_ACTIONS } from "@gitea-portal/domain";
import { IssueAssigneeRoster } from "./IssueAssigneeRoster";
import { useTranslation } from "react-i18next";
import {
  statusNextActionTranslationKey,
  statusReasonTranslationKey,
} from "../../i18n/status";
import { formatDateTime } from "../../i18n/format";
import { UserIdentity } from "../../components/ui/UserIdentity";
import { profileFor } from "../../lib/user-profiles";
export function IssueDetailHeader({ issue }: { issue: Issue }) {
  const { t } = useTranslation("issues");
  const action = STATUS_ACTIONS.find(
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
        <IssueStatusBadge status={issue.status} />
        <span>{t("nextAction", { action: t(statusNextActionTranslationKey(issue.nextActionKey)) })}</span>
        {action && <span>{t("lastReason")}：{t(statusReasonTranslationKey(action.key))}</span>}
        <ScheduleDates
          startDate={issue.startDate}
          dueDate={issue.dueDate}
          scheduleAnomaly={issue.scheduleAnomaly}
          className="schedule-dates--compact"
        />
        <span>{t("milestone")}：{issue.milestone ?? t("notSet")}</span>
        <time dateTime={issue.updatedAt}>
          {t("updatedAt", {
            date: formatDateTime(issue.updatedAt),
          })}
        </time>
      </div>
      {issue.scheduleStatus === "invalid" && (
        <p className="schedule-anomaly" role="status">
          {t(scheduleAnomalyTranslationKey(issue.scheduleAnomaly))}
        </p>
      )}
      <IssueAssigneeRoster issue={issue} />
      <p className="issue-author"><strong>{t("author")}:</strong><UserIdentity user={profileFor(issue.userProfiles, issue.author)} /></p>
      <LabelList labels={issue.labels} />
    </>
  );
}
