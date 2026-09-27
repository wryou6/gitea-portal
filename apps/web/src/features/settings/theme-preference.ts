export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY_PREFIX = "gitea-portal:theme:";

function storageKey(login: string): string {
  return `${STORAGE_KEY_PREFIX}${encodeURIComponent(login)}`;
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

export function readThemePreference(login?: string): ThemeMode {
  if (!login) return "system";

  try {
    const cached = window.localStorage.getItem(storageKey(login));
    return isThemeMode(cached) ? cached : "system";
  } catch {
    return "system";
  }
}

export function saveThemePreference(
  login: string | undefined,
  mode: ThemeMode,
): void {
  if (!login) return;

  try {
    window.localStorage.setItem(storageKey(login), mode);
  } catch {
    // The selection still applies for this visit if browser storage is unavailable.
  }
}

export function applyThemePreference(mode: ThemeMode): void {
  const followsDarkSystemTheme =
    mode === "system" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle(
    "dark",
    mode === "dark" || followsDarkSystemTheme,
  );
}

export function subscribeToSystemTheme(mode: ThemeMode): () => void {
  if (mode !== "system" || typeof window.matchMedia !== "function") {
    return () => undefined;
  }

  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const applySystemTheme = () => applyThemePreference("system");
  systemTheme.addEventListener("change", applySystemTheme);

  return () => systemTheme.removeEventListener("change", applySystemTheme);
}
