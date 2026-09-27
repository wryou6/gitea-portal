import type { Issue } from "../../lib/api";
import { LabelList } from "./LabelList";
import { Badge } from "../../components/ui/Badge";
import { IssueTypeBadge } from "../../components/ui/IssueTypeBadge";
import { ScheduleDates, scheduleAnomalyMessage } from "./ScheduleDates";
import { visibleIssueLabels } from "./issueLabelPresentation";
export function IssueDetailHeader({ issue }: { issue: Issue }) {
  return (
    <>
      <p className="eyebrow">
        {issue.owner}/{issue.name} #{issue.number}
      </p>
      <h1>{issue.title}</h1>
      <div className="issue-detail-type">
        <IssueTypeBadge type={issue.type} labels={issue.labels} />
      </div>
      <div className="meta">
        <Badge className={issue.state}>
          {issue.state === "open" ? "Open" : "Closed"}
        </Badge>
        <span>Assignee：{issue.assignee ?? "未指派"}</span>
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
      <LabelList labels={visibleIssueLabels(issue.labels)} />
    </>
  );
}
