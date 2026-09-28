import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { changeLocale } from "./i18n";
import { readLocalePreference } from "./features/settings/locale-preference";
import {
  applyThemePreference,
  readThemePreference,
  type ThemeMode,
} from "./features/settings/theme-preference";
import { api } from "./lib/api";
import { PortalApiError } from "./lib/api";
import type { SessionBootstrapState } from "./features/auth/session-state";
import "./index.css";

const SESSION_EXPIRED_KEY = "gitea-portal:session-expired";
const AUTH_ERROR_QUERY = "portalAuthError";

async function bootstrap() {
  let sessionState: SessionBootstrapState;
  let initialTheme: ThemeMode = "system";
  let sessionExpiredNotice = false;
  try {
    const { login } = await api<{ login: string }>("/api/session");
    sessionState = { status: "authenticated", login };
    initialTheme = readThemePreference(login);
    try {
      sessionExpiredNotice =
        window.sessionStorage.getItem(SESSION_EXPIRED_KEY) === "1";
      if (sessionExpiredNotice)
        window.sessionStorage.removeItem(SESSION_EXPIRED_KEY);
    } catch {
      // Authentication remains usable when browser storage is unavailable.
    }
  } catch (error) {
    if (error instanceof PortalApiError && error.code === "auth.required") {
      const authError = new URLSearchParams(window.location.search).get(
        AUTH_ERROR_QUERY,
      );
      sessionState = {
        status: "anonymous",
        ...(authError === "denied" || authError === "failed"
          ? { error: authError }
          : {}),
      };
      try {
        sessionExpiredNotice =
          window.sessionStorage.getItem(SESSION_EXPIRED_KEY) === "1";
      } catch {
        // The login page remains usable when browser storage is unavailable.
      }
    } else {
      sessionState = { status: "unavailable" };
    }
  }

  const login =
    sessionState.status === "authenticated" ? sessionState.login : undefined;
  const initialLocale = readLocalePreference(login);
  await changeLocale(initialLocale);
  applyThemePreference(initialTheme);
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App
        login={login}
        sessionState={sessionState}
        initialTheme={initialTheme}
        initialLocale={initialLocale}
        sessionExpiredNotice={sessionExpiredNotice}
      />
    </StrictMode>,
  );
}

void bootstrap();
