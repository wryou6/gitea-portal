import { useTranslation } from "react-i18next";
import { safeReturnTo } from "../../app/routes";

type LoginError = "denied" | "failed";

export function LoginPage({
  returnTo,
  error,
  sessionExpired = false,
}: {
  returnTo: string;
  error?: LoginError;
  sessionExpired?: boolean;
}) {
  const { t } = useTranslation("auth");
  const loginUrl = new URL("/auth/login", window.location.origin);
  const safeTarget = safeReturnTo(returnTo) ?? "/";
  loginUrl.searchParams.set("returnTo", safeTarget);

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <a className="auth-brand" href="/" aria-label="Gitea Portal">
          <img src="/favicon.svg" alt="" />
          <span>Gitea Portal</span>
        </a>
        <div className="auth-copy">
          <p className="auth-eyebrow">{t("loginProvider")}</p>
          <h1 id="auth-title">{t("loginTitle")}</h1>
          <p>{t("loginDescription")}</p>
        </div>
        {sessionExpired && (
          <div className="auth-message auth-message--notice" role="status">
            <p>{t("loginSessionExpired")}</p>
            <p>{t("unsavedIssueValues")}</p>
          </div>
        )}
        {error && (
          <div className="auth-message auth-message--error" role="alert">
            {t(error === "denied" ? "loginDenied" : "loginFailed")}
          </div>
        )}
        <a className="auth-login-action" href={loginUrl.toString()}>
          <span className="auth-gitea-mark" aria-hidden="true">G</span>
          <span>{t("loginAction")}</span>
          <span className="auth-action-arrow" aria-hidden="true">→</span>
        </a>
      </section>
    </main>
  );
}
