import { useTranslation } from "react-i18next";

export function OverdueIndicator() {
  const { t } = useTranslation("issues");
  return (
    <span className="overdue-indicator" role="img" aria-label={t("overdue")}>
      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
        <path d="M13.2 2.5c.5 3.3-1.2 4.8-2.3 6.3C10.2 7.4 9.3 6.2 8 5.6c.3 2.1-.4 3.4-1.4 5C5.7 12.1 5 13.4 5 15a7 7 0 0 0 14 0c0-4.2-2.3-7.9-5.8-12.5Z" />
        <path className="overdue-indicator-flame-core" d="M12 19a3.5 3.5 0 0 1-3.5-3.5c0-.9.4-1.6 1-2.4.4.8 1 1.4 1.9 1.7.1-1.3.6-2.2 1.6-3.1 1.3 1.3 2.5 2.7 2.5 4.1A3.5 3.5 0 0 1 12 19Z" />
      </svg>
    </span>
  );
}
