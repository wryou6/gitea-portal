import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { changeLocale } from "./i18n";
import { readLocalePreference } from "./features/settings/locale-preference";
import {
  applyColorPalette,
  applyThemePreference,
  readColorPalettePreference,
  readThemePreference,
  type ColorPalette,
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
  let initialPalette: ColorPalette = "cobalt";
  let sessionExpiredNotice = false;
  try {
    const { login, displayName, avatarUrl } = await api<{ login: string; displayName?: string; avatarUrl?: string }>("/api/session");
    sessionState = { status: "authenticated", login, displayName, avatarUrl };
    initialTheme = readThemePreference(login);
    initialPalette = readColorPalettePreference(login);
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
  applyColorPalette(initialPalette);
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App
        login={login}
        displayName={sessionState.status === "authenticated" ? sessionState.displayName : undefined}
        avatarUrl={sessionState.status === "authenticated" ? sessionState.avatarUrl : undefined}
        sessionState={sessionState}
        initialTheme={initialTheme}
        initialPalette={initialPalette}
        initialLocale={initialLocale}
        sessionExpiredNotice={sessionExpiredNotice}
      />
    </StrictMode>,
  );
}

void bootstrap();
