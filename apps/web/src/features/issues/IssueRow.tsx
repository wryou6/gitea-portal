import type { Issue } from "../../lib/api";
import { LabelList } from "./LabelList";
import { routePaths } from "../../app/routes";
import {
  issueTypeDisplayName,
  issueTypeStatusFromLabels,
} from "@gitea-portal/domain";

export function IssueRow({
  issue,
  returnTo,
}: {
  issue: Issue;
  returnTo?: string;
}) {
  const typeStatus = issueTypeStatusFromLabels(issue.labels);
  const typeText = issue.type
    ? issueTypeDisplayName(issue.type)
    : typeStatus === "missing"
      ? "未設定"
      : "衝突";

  return (
    <article className="issue-row">
      <div style={{ minWidth: 0 }}>
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
        <div className="meta">
          <span>
            {issue.owner}/{issue.name} #{issue.number}
          </span>
          <span className={issue.state}>
            {issue.state === "open" ? "Open" : "Closed"}
          </span>
          <span
            className={issue.type ? undefined : "schedule-anomaly"}
            role={issue.type ? undefined : "status"}
          >
            Type：{typeText}
          </span>
          <span>{issue.assignee ?? "未指派"}</span>
          <span>Start：{issue.startDate ?? "未設定"}</span>
          <span>Due：{issue.dueDate ?? "未設定"}</span>
          <span>{issue.milestone ?? "未設定 Milestone"}</span>
          {issue.scheduleStatus === "invalid" && (
            <span className="schedule-anomaly" role="status">
              排程日期異常：{issue.scheduleAnomaly}
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
