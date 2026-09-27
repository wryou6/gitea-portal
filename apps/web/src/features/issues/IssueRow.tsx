import type { Issue } from "../../lib/api";
import { LabelList } from "./LabelList";
import { routePaths } from "../../app/routes";
import { IssueTypeBadge } from "../../components/ui/IssueTypeBadge";
import { ScheduleDates, scheduleAnomalyMessage } from "./ScheduleDates";
import { visibleIssueLabels } from "./issueLabelPresentation";

export function IssueRow({
  issue,
  returnTo,
}: {
  issue: Issue;
  returnTo?: string;
}) {
  return (
    <article className="issue-row">
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
        </div>
        <div className="meta">
          <span>
            {issue.owner}/{issue.name} #{issue.number}
          </span>
          <span className={issue.state}>
            {issue.state === "open" ? "Open" : "Closed"}
          </span>
          <span>{issue.assignee ?? "未指派"}</span>
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
      <LabelList labels={visibleIssueLabels(issue.labels)} />
    </article>
  );
}
