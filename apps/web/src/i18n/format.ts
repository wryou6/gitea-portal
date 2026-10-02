const numericGregorianLocale = "en-US-u-ca-gregory-nu-latn";

function formatNumericDate(
  date: Date,
  timeZone?: string,
  includeTime = false,
): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat(numericGregorianLocale, {
      calendar: "gregory",
      numberingSystem: "latn",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      ...(timeZone ? { timeZone } : {}),
      ...(includeTime
        ? { hour: "2-digit", minute: "2-digit", hourCycle: "h23" as const }
        : {}),
    }).formatToParts(date).map(({ type, value }) => [type, value]),
  );
  const year = (parts.year ?? "").padStart(4, "0");
  const month = parts.month ?? "";
  const day = parts.day ?? "";
  const dateText = `${year}/${month}/${day}`;

  if (!includeTime) return dateText;
  return `${dateText} ${parts.hour ?? ""}:${parts.minute ?? ""}`;
}

export function formatDateTime(value: string): string {
  return formatNumericDate(new Date(value), undefined, true);
}

export function formatCalendarDate(value: string): string {
  const dateAtUtcMidnight = new Date(`${value}T00:00:00.000Z`);
  return formatNumericDate(dateAtUtcMidnight, "UTC");
}

export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}
