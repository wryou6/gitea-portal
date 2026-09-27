import type { Issue } from "../../lib/api";
import { LabelList } from "./LabelList";
import { routePaths } from "../../app/routes";
import { IssueTypeBadge } from "../../components/ui/IssueTypeBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { ScheduleDates, scheduleAnomalyMessage } from "./ScheduleDates";

export function IssueRow({
  issue,
  returnTo,
}: {
  issue: Issue;
  returnTo?: string;
}) {
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
            {issue.workflowState === "todo"
              ? "待辦"
              : issue.workflowState === "in-progress"
                ? "處理中"
                : issue.workflowState === "done"
                  ? "已完成"
                  : "狀態異常"}
          </span>
          <span>目前負責人：{issue.currentOwner ?? "無"}</span>
          <span>下一步：{issue.nextAction}</span>
          <ScheduleDates
            startDate={issue.startDate}
            dueDate={issue.dueDate}
            scheduleAnomaly={issue.scheduleAnomaly}
            className="schedule-dates--compact"
          />
          <span>{issue.milestone ?? "未設定 Milestone"}</span>
          {issue.scheduleStatus === "invalid" && (
            <span className="schedule-anomaly" role="status">
              {scheduleAnomalyMessage(issue.scheduleAnomaly)}
            </span>
          )}
          <time dateTime={issue.updatedAt}>
            {new Date(issue.updatedAt).toLocaleString("zh-TW")}
          </time>
        </div>
      </div>
      <LabelList labels={issue.labels} />
    </article>
  );
}
