import type { Issue } from "../../lib/api";
import { LabelList } from "./LabelList";
import { Badge } from "../../components/ui/Badge";
import {
  issueTypeDisplayName,
  issueTypeStatusFromLabels,
} from "@gitea-portal/domain";
export function IssueDetailHeader({ issue }: { issue: Issue }) {
  const typeStatus = issueTypeStatusFromLabels(issue.labels);
  const typeText = issue.type
    ? issueTypeDisplayName(issue.type)
    : typeStatus === "missing"
      ? "未設定"
      : "衝突";

  return (
    <>
      <p className="eyebrow">
        {issue.owner}/{issue.name} #{issue.number}
      </p>
      <h1>{issue.title}</h1>
      <p className="meta">
        <Badge className={issue.state}>
          {issue.state === "open" ? "Open" : "Closed"}
        </Badge>
        <span
          className={issue.type ? undefined : "schedule-anomaly"}
          role={issue.type ? undefined : "status"}
        >
          Type：{typeText}
        </span>
        <span>Assignee：{issue.assignee ?? "未指派"}</span>
        <span>Start：{issue.startDate ?? "未設定"}</span>
        <span>Due：{issue.dueDate ?? "未設定"}</span>
        <span>Milestone：{issue.milestone ?? "未設定 Milestone"}</span>
        <time dateTime={issue.updatedAt}>
          更新於 {new Date(issue.updatedAt).toLocaleString("zh-TW")}
        </time>
      </p>
      {issue.scheduleStatus === "invalid" && (
        <p className="schedule-anomaly" role="status">
          排程日期異常：{issue.scheduleAnomaly}
        </p>
      )}
      <LabelList labels={issue.labels} />
    </>
  );
}
