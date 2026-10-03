export type ThemeMode = "light" | "dark" | "system";
export type ColorPalette =
  | "cobalt"
  | "juniper"
  | "iris"
  | "carbon"
  | "ember"
  | "glacier";

const colorPalettes: readonly ColorPalette[] = [
  "cobalt",
  "juniper",
  "iris",
  "carbon",
  "ember",
  "glacier",
];

const STORAGE_KEY_PREFIX = "gitea-portal:theme:";
const PALETTE_STORAGE_KEY_PREFIX = "gitea-portal:palette:";

function storageKey(login: string): string {
  return `${STORAGE_KEY_PREFIX}${encodeURIComponent(login)}`;
}

function paletteStorageKey(login: string): string {
  return `${PALETTE_STORAGE_KEY_PREFIX}${encodeURIComponent(login)}`;
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function isColorPalette(value: string | null): value is ColorPalette {
  return colorPalettes.some((palette) => palette === value);
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

export function readColorPalettePreference(login?: string): ColorPalette {
  if (!login) return "cobalt";

  try {
    const cached = window.localStorage.getItem(paletteStorageKey(login));
    return isColorPalette(cached) ? cached : "cobalt";
  } catch {
    return "cobalt";
  }
}

export function saveColorPalettePreference(
  login: string | undefined,
  palette: ColorPalette,
): void {
  if (!login) return;

  try {
    window.localStorage.setItem(paletteStorageKey(login), palette);
  } catch {
    // The selection still applies for this visit if browser storage is unavailable.
  }
}

export function applyColorPalette(palette: ColorPalette): void {
  document.documentElement.dataset.palette = palette;
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
