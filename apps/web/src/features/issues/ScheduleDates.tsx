import type { ReactNode } from "react";
import {
  isCalendarDate,
  type IssueScheduleAnomaly,
} from "@gitea-portal/domain";

export function formatScheduleDate(value: string | null): string | null {
  if (!value || !isCalendarDate(value)) return null;
  return value.replaceAll("-", "/");
}

export function scheduleAnomalyMessage(
  anomaly?: IssueScheduleAnomaly,
): string {
  switch (anomaly) {
    case "invalid_start_date":
      return "開始日期格式無效";
    case "multiple_start_dates":
      return "有多個開始日期";
    case "invalid_due_date":
      return "到期日期格式無效";
    case "date_range_reversed":
      return "開始日期晚於到期日期";
    default:
      return "排程日期異常";
  }
}

function displayValue(
  date: string | null,
  field: "start" | "due",
  anomaly?: IssueScheduleAnomaly,
): ReactNode {
  const fieldIsInvalid =
    (field === "start" &&
      (anomaly === "invalid_start_date" ||
        anomaly === "multiple_start_dates")) ||
    (field === "due" && anomaly === "invalid_due_date");

  if (fieldIsInvalid) return "日期異常";
  if (!date) return "未設定";

  const formatted = formatScheduleDate(date);
  return formatted ? <time dateTime={date}>{formatted}</time> : "日期異常";
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
  return (
    <dl
      className={`schedule-dates${className ? ` ${className}` : ""}`}
      aria-label="排程日期"
    >
      <div className="schedule-date">
        <dt>開始</dt>
        <dd>{displayValue(startDate, "start", scheduleAnomaly)}</dd>
      </div>
      <div className="schedule-date">
        <dt>到期</dt>
        <dd>{displayValue(dueDate, "due", scheduleAnomaly)}</dd>
      </div>
    </dl>
  );
}
