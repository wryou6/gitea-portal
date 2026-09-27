export const supportedLocales = ["zh-TW", "en", "ja"] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = "zh-TW";

export function resolveLocale(value: string | null | undefined): Locale | undefined {
  if (!value) return undefined;

  const language = value.trim().replaceAll("_", "-").toLowerCase();
  if (language === "zh" || language.startsWith("zh-")) return "zh-TW";
  if (language === "en" || language.startsWith("en-")) return "en";
  if (language === "ja" || language.startsWith("ja-")) return "ja";
  return undefined;
}

export function resolveBrowserLocale(
  languages: readonly string[] =
    typeof navigator === "undefined" ? [] : navigator.languages,
): Locale {
  for (const language of languages) {
    const locale = resolveLocale(language);
    if (locale) return locale;
  }

  return defaultLocale;
}
