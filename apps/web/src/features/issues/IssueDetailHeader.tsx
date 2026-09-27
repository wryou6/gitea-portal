import type { Issue } from "../../lib/api";
import { LabelList } from "./LabelList";
import { Badge } from "../../components/ui/Badge";
import { IssueTypeBadge } from "../../components/ui/IssueTypeBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { ScheduleDates, scheduleAnomalyMessage } from "./ScheduleDates";
import { WORKFLOW_ACTIONS } from "@gitea-portal/domain";
import { IssueAssigneeRoster } from "./IssueAssigneeRoster";
export function IssueDetailHeader({ issue }: { issue: Issue }) {
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
          {issue.workflowState === "todo"
            ? "待辦"
            : issue.workflowState === "in-progress"
              ? "處理中"
              : issue.workflowState === "done"
                ? "已完成"
                : "狀態異常"}
        </Badge>
        <span>下一步：{issue.nextAction}</span>
        {action && <span>最後原因：{action.reasonLabel}</span>}
        <ScheduleDates
          startDate={issue.startDate}
          dueDate={issue.dueDate}
          scheduleAnomaly={issue.scheduleAnomaly}
          className="schedule-dates--compact"
        />
        <span>Milestone：{issue.milestone ?? "未設定 Milestone"}</span>
        <time dateTime={issue.updatedAt}>
          更新於 {new Date(issue.updatedAt).toLocaleString("zh-TW")}
        </time>
      </div>
      {issue.scheduleStatus === "invalid" && (
        <p className="schedule-anomaly" role="status">
          {scheduleAnomalyMessage(issue.scheduleAnomaly)}
        </p>
      )}
      <IssueAssigneeRoster issue={issue} />
      <LabelList labels={issue.labels} />
    </>
  );
}
