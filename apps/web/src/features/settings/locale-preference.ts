import {
  defaultLocale,
  resolveBrowserLocale,
  resolveLocale,
  type Locale,
} from "../../i18n/locales";

const STORAGE_KEY_PREFIX = "gitea-portal:locale:";

function storageKey(login: string): string {
  return `${STORAGE_KEY_PREFIX}${encodeURIComponent(login)}`;
}

export function readLocalePreference(
  login?: string,
  browserLanguages?: readonly string[],
): Locale {
  if (!login) return resolveBrowserLocale(browserLanguages);

  try {
    const saved = window.localStorage.getItem(storageKey(login));
    const locale = resolveLocale(saved);
    if (locale) return locale;
  } catch {
    // Fall through to the browser locale when storage is unavailable.
  }

  return resolveBrowserLocale(browserLanguages);
}

export function saveLocalePreference(
  login: string | undefined,
  locale: Locale,
): void {
  if (!login) return;

  try {
    window.localStorage.setItem(storageKey(login), locale);
  } catch {
    // The current visit still uses the selected locale if storage is unavailable.
  }
}

export { defaultLocale };
