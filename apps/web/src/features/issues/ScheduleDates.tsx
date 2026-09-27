import type { ReactNode } from "react";
import {
  isCalendarDate,
  type IssueScheduleAnomaly,
} from "@gitea-portal/domain";
import { useTranslation } from "react-i18next";
import { formatCalendarDate } from "../../i18n/format";

export function formatScheduleDate(
  value: string | null,
  locale = "zh-TW",
): string | null {
  if (!value || !isCalendarDate(value)) return null;
  return formatCalendarDate(value, locale);
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
  locale = "zh-TW",
): ReactNode {
  const fieldIsInvalid =
    (field === "start" &&
      (anomaly === "invalid_start_date" ||
        anomaly === "multiple_start_dates")) ||
    (field === "due" && anomaly === "invalid_due_date");

  if (fieldIsInvalid) return translate("dateInvalid");
  if (!date) return translate("notSet");

  const formatted = formatScheduleDate(date, locale);
  return formatted ? <time dateTime={date}>{formatted}</time> : translate("dateInvalid");
}

export function ScheduleDates({
  startDate,
  dueDate,
  scheduleAnomaly,
  className,
}: {
  startDate: string | null;
  dueDate: string | null;
  scheduleAnomaly?: IssueScheduleAnomaly;
  className?: string;
}) {
  const { t, i18n } = useTranslation("issues");
  return (
    <dl
      className={`schedule-dates${className ? ` ${className}` : ""}`}
      aria-label={t("scheduleDates")}
    >
      <div className="schedule-date">
        <dt>{t("start")}</dt>
        <dd>{displayValue(startDate, "start", t, scheduleAnomaly, i18n.language)}</dd>
      </div>
      <div className="schedule-date">
        <dt>{t("due")}</dt>
        <dd>{displayValue(dueDate, "due", t, scheduleAnomaly, i18n.language)}</dd>
      </div>
    </dl>
  );
}
