import { useTranslation } from "react-i18next";

export function SessionUnavailable({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation("auth");

  return (
    <main className="auth-page">
      <section className="auth-card auth-card--unavailable" aria-labelledby="auth-unavailable-title">
        <div className="auth-status-icon" aria-hidden="true">!</div>
        <div className="auth-copy">
          <h1 id="auth-unavailable-title">{t("sessionUnavailableTitle")}</h1>
          <p>{t("sessionUnavailableDescription")}</p>
        </div>
        <button className="auth-login-action" type="button" onClick={onRetry}>
          <span>{t("retrySession")}</span>
          <span className="auth-action-arrow" aria-hidden="true">↻</span>
        </button>
      </section>
    </main>
  );
}
