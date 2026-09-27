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
import "./index.css";

async function bootstrap() {
  let login: string | undefined;
  let initialTheme: ThemeMode = "system";
  try {
    login = (await api<{ login: string }>("/api/session")).login;
    initialTheme = readThemePreference(login);
  } catch {
    // Keep the existing app usable when the session has expired or is unavailable.
  }

  const initialLocale = readLocalePreference(login);
  await changeLocale(initialLocale);
  applyThemePreference(initialTheme);
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App login={login} initialTheme={initialTheme} initialLocale={initialLocale} />
    </StrictMode>,
  );
}

void bootstrap();
