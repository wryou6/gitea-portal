import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

export function SessionExpiredNotice() {
  const { t } = useTranslation("auth");
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return createPortal(
    <div className="auth-expired-notice" role="status" aria-live="polite">
      <strong className="auth-expired-notice__title">
        {t("sessionRestored")}
      </strong>
      <button
        className="auth-expired-notice__close"
        type="button"
        aria-label={t("dismissSessionNotice")}
        onClick={() => setDismissed(true)}
      >
        ×
      </button>
      <span>{t("unsavedIssueValues")}</span>
    </div>,
    document.body,
  );
}
