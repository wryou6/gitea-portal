import type { ReactNode } from "react";
import type { Issue, IssueSortField } from "../../lib/api";
import { routePaths } from "../../app/routes";
import { IssueTypeBadge } from "../../components/ui/IssueTypeBadge";
import { IssueStatusBadge } from "../../components/ui/IssueStatusBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { useTranslation } from "react-i18next";
import { formatCalendarDate, formatDateTime } from "../../i18n/format";
import { scheduleAnomalyTranslationKey } from "./ScheduleDates";
import { isCalendarDate } from "@gitea-portal/domain";
import { DEFAULT_ISSUE_COLUMN_ORDER, ISSUE_VIEW_FIELDS } from "./issue-view-preference";

function localToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function IssueRow({
  issue,
  returnTo,
  columnOrder = DEFAULT_ISSUE_COLUMN_ORDER,
  visibleFields = ISSUE_VIEW_FIELDS,
}: {
  issue: Issue;
  returnTo?: string;
  columnOrder?: IssueSortField[];
  visibleFields?: IssueSortField[];
}) {
  const { t, i18n } = useTranslation("issues");
  const issuePath = returnTo
    ? routePaths.issueDetailFrom(issue.owner, issue.name, issue.number, returnTo)
    : routePaths.issueDetail(issue.owner, issue.name, issue.number);
  const hasDateAnomaly = issue.scheduleStatus === "invalid";
  const dueDateInvalid =
    issue.scheduleAnomaly === "invalid_due_date" ||
    issue.scheduleAnomaly === "date_range_reversed";
  const dueDate =
    !dueDateInvalid && issue.dueDate && isCalendarDate(issue.dueDate)
      ? issue.dueDate
      : null;
  const overdue = issue.state === "open" && dueDate !== null && dueDate < localToday();
  const cells: Record<IssueSortField, ReactNode> = {
    type: <IssueTypeBadge type={issue.type} labels={issue.labels} />,
    key: (
      <a
        className="issue-key"
        href={issuePath}
        aria-label={t("openIssueKey", { key: `${issue.owner}/${issue.name}#${issue.number}` })}
      >
        {issue.owner}/{issue.name}#{issue.number}
      </a>
    ),
    title: (
      <>
        <a className="issue-title" href={issuePath}>{issue.title}</a>
        {hasDateAnomaly && (
          <span className="issue-table-anomaly" title={t(scheduleAnomalyTranslationKey(issue.scheduleAnomaly))}>
            {t("scheduleAnomaly")}
          </span>
        )}
      </>
    ),
    assignee: issue.assignee ?? t("notAssigned"),
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
            ? <span className="due-date-overdue"><svg aria-hidden="true" viewBox="0 0 16 16" focusable="false"><path d="M8 1.25c.46 1.76-.18 2.48-.91 3.29-.67.75-1.42 1.58-1.42 3.04a2.33 2.33 0 0 0 1.67 2.23c-.16-.43-.16-.93.03-1.4.23-.58.7-1.02 1.02-1.54.55.62.88 1.32.88 2.12 0 .45-.14.86-.38 1.2a2.39 2.39 0 0 0 2.04-2.37c0-1.55-.73-2.73-1.63-3.88.05 1.18-.25 1.63-.71 2.11.12-1.08.07-2.59-.59-4.8Z" /></svg><time dateTime={dueDate}>{formatCalendarDate(dueDate)}</time><span className="sr-only">{t("overdue")}</span></span>
            : <time dateTime={dueDate}>{formatCalendarDate(dueDate)}</time>
          : t("notSet"),
    author: issue.author || t("notSet"),
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
