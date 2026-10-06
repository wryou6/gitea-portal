import type { ReactNode } from "react";
import {
  isCalendarDate,
  type IssueScheduleAnomaly,
} from "@gitea-portal/domain";
import { useTranslation } from "react-i18next";
import { formatCalendarDate } from "../../i18n/format";
import { OverdueIndicator } from "./OverdueIndicator";

export function formatScheduleDate(
  value: string | null,
): string | null {
  if (!value || !isCalendarDate(value)) return null;
  return formatCalendarDate(value);
}

export function scheduleAnomalyTranslationKey(
  anomaly?: IssueScheduleAnomaly,
): string {
  switch (anomaly) {
    case "invalid_start_date":
      return "startDateInvalid";
    case "multiple_start_dates":
      return "multipleStartDates";
    case "invalid_due_date":
      return "dueDateInvalid";
    case "date_range_reversed":
      return "dateRangeReversed";
    default:
      return "scheduleAnomaly";
  }
}

function displayValue(
  date: string | null,
  field: "start" | "due",
  translate: (key: string) => string,
  anomaly?: IssueScheduleAnomaly,
): ReactNode {
  const fieldIsInvalid =
    (field === "start" &&
      (anomaly === "invalid_start_date" ||
        anomaly === "multiple_start_dates")) ||
    (field === "due" && anomaly === "invalid_due_date");

  if (fieldIsInvalid) return translate("dateInvalid");
  if (!date) return translate("notSet");

  const formatted = formatScheduleDate(date);
  return formatted ? <time dateTime={date}>{formatted}</time> : translate("dateInvalid");
}

export function ScheduleDates({
  startDate,
  dueDate,
  scheduleAnomaly,
  className,
  dueOnly = false,
  overdue = false,
}: {
  startDate: string | null;
  dueDate: string | null;
  scheduleAnomaly?: IssueScheduleAnomaly;
  className?: string;
  dueOnly?: boolean;
  overdue?: boolean;
}) {
  const { t } = useTranslation("issues");
  const dueDateCanBeOverdue =
    overdue &&
    Boolean(dueDate && isCalendarDate(dueDate)) &&
    scheduleAnomaly !== "invalid_due_date" &&
    scheduleAnomaly !== "date_range_reversed";
  return (
    <dl
      className={`schedule-dates${className ? ` ${className}` : ""}`}
      aria-label={t("scheduleDates")}
    >
      {!dueOnly && (
        <div className="schedule-date">
          <dt>{t("start")}</dt>
          <dd>{displayValue(startDate, "start", t, scheduleAnomaly)}</dd>
        </div>
      )}
      <div className="schedule-date">
        <dt>{t("due")}</dt>
        <dd>
          {dueDateCanBeOverdue ? (
            <span className="due-date-overdue">
              {displayValue(dueDate, "due", t, scheduleAnomaly)}
              <OverdueIndicator />
            </span>
          ) : (
            displayValue(dueDate, "due", t, scheduleAnomaly)
          )}
        </dd>
      </div>
    </dl>
  );
}
