import { useTranslation } from "react-i18next";

export function SessionExpiredNotice() {
  const { t } = useTranslation("auth");

  return (
    <div className="auth-expired-notice" role="status" aria-live="polite">
      <strong>{t("sessionRestored")}</strong>
      <span>{t("unsavedIssueValues")}</span>
    </div>
  );
}
