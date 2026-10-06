import type { ReactNode } from "react";
import { Link } from "react-router";
import type { Issue, IssueSortField } from "../../lib/api";
import { routePaths } from "../../app/routes";
import { IssueTypeBadge } from "../../components/ui/IssueTypeBadge";
import { IssueStatusBadge } from "../../components/ui/IssueStatusBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { useTranslation } from "react-i18next";
import { formatCalendarDate, formatDateTime } from "../../i18n/format";
import { scheduleAnomalyTranslationKey } from "./ScheduleDates";
import { isCalendarDate } from "@gitea-portal/domain";
import { OverdueIndicator } from "./OverdueIndicator";
import { isIssueOverdue } from "./overdue-date";
import { DEFAULT_ISSUE_COLUMN_ORDER, ISSUE_VIEW_FIELDS } from "./issue-view-preference";
import { UserIdentity } from "../../components/ui/UserIdentity";
import { AssigneeIdentityGroup } from "../../components/ui/AssigneeIdentityGroup";
import { assigneeLoginsForDisplay } from "../../lib/assignee-display";
import { profileFor } from "../../lib/user-profiles";

export function IssueRow({
  issue,
  returnTo,
  columnOrder = DEFAULT_ISSUE_COLUMN_ORDER,
  visibleFields = ISSUE_VIEW_FIELDS,
  showRepositoryIdentity = false,
}: {
  issue: Issue;
  returnTo?: string;
  columnOrder?: IssueSortField[];
  visibleFields?: IssueSortField[];
  showRepositoryIdentity?: boolean;
}) {
  const { t, i18n } = useTranslation("issues");
  const issuePath = returnTo
    ? routePaths.issueDetailFrom(issue.owner, issue.name, issue.number, returnTo)
    : routePaths.issueDetail(issue.owner, issue.name, issue.number);
  const hasDateAnomaly = issue.scheduleStatus === "invalid";
  const assigneeUsers = assigneeLoginsForDisplay(issue).map((login) =>
    profileFor(issue.userProfiles, login),
  );
  const dueDateInvalid =
    issue.scheduleAnomaly === "invalid_due_date" ||
    issue.scheduleAnomaly === "date_range_reversed";
  const dueDate =
    !dueDateInvalid && issue.dueDate && isCalendarDate(issue.dueDate)
      ? issue.dueDate
      : null;
  const overdue = isIssueOverdue(issue);
  const cells: Record<IssueSortField, ReactNode> = {
    type: <IssueTypeBadge type={issue.type} labels={issue.labels} />,
    key: (
      <Link
        className="issue-key"
        to={issuePath}
        aria-label={t("openIssueKey", { key: `${issue.owner}/${issue.name}#${issue.number}` })}
      >
        {issue.owner}/{issue.name}#{issue.number}
      </Link>
    ),
    title: (
      <>
        <Link className="issue-title" to={issuePath}>{issue.title}</Link>
        {showRepositoryIdentity && (
          <span className="issue-row-repository">{issue.owner}/{issue.name}</span>
        )}
        {hasDateAnomaly && (
          <span className="issue-table-anomaly" title={t(scheduleAnomalyTranslationKey(issue.scheduleAnomaly))}>
            {t("scheduleAnomaly")}
          </span>
        )}
      </>
    ),
    assignee: <AssigneeIdentityGroup users={assigneeUsers} emptyLabel={t("notAssigned")} />,
    status: <IssueStatusBadge status={issue.status} />,
    priority: <PriorityBadge priority={issue.priority} labels={issue.labels} />,
    createdAt: <time dateTime={issue.createdAt}>{formatDateTime(issue.createdAt)}</time>,
    startDate:
      issue.scheduleAnomaly === "invalid_start_date" || issue.scheduleAnomaly === "multiple_start_dates"
        ? t("dateInvalid")
        : issue.startDate
          ? formatCalendarDate(issue.startDate)
          : t("notSet"),
    dueDate:
      dueDateInvalid
        ? t("dateInvalid")
        : dueDate
          ? overdue
            ? <span className="due-date-overdue"><time dateTime={dueDate}>{formatCalendarDate(dueDate)}</time><OverdueIndicator /></span>
            : <time dateTime={dueDate}>{formatCalendarDate(dueDate)}</time>
          : t("notSet"),
    author: issue.author ? <UserIdentity user={profileFor(issue.userProfiles, issue.author)} /> : t("notSet"),
  };

  return (
    <tr className="issue-table-row">
      {columnOrder.filter((field) => visibleFields.includes(field)).map((field) => (
        <td
          key={field}
          data-column-field={field}
          data-reorder-key={`${issue.owner}/${issue.name}#${issue.number}:${field}`}
          data-column-align={field === "type" || field === "status" || field === "priority" ? "center" : undefined}
          className={field === "title" ? "issue-table-title-cell" : undefined}
        >
          {cells[field]}
        </td>
      ))}
    </tr>
  );
}
