import i18next, { type i18n as I18nInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import { defaultLocale, type Locale } from "./locales";
import { apiErrors } from "./resources/api-errors";
import { boards } from "./resources/boards";
import { common } from "./resources/common";
import { feedback } from "./resources/feedback";
import { issues } from "./resources/issues";
import { settings } from "./resources/settings";

export const resources = {
  "zh-TW": {
    common: common["zh-TW"],
    settings: settings["zh-TW"],
    issues: issues["zh-TW"],
    boards: boards["zh-TW"],
    feedback: feedback["zh-TW"],
    "api-errors": apiErrors["zh-TW"],
  },
  en: {
    common: common.en,
    settings: settings.en,
    issues: issues.en,
    boards: boards.en,
    feedback: feedback.en,
    "api-errors": apiErrors.en,
  },
  ja: {
    common: common.ja,
    settings: settings.ja,
    issues: issues.ja,
    boards: boards.ja,
    feedback: feedback.ja,
    "api-errors": apiErrors.ja,
  },
} as const;

export const i18n: I18nInstance = i18next.createInstance();

void i18n.use(initReactI18next).init({
  resources,
  lng: defaultLocale,
  fallbackLng: defaultLocale,
  defaultNS: "common",
  ns: ["common", "settings", "issues", "boards", "feedback", "api-errors"],
  interpolation: { escapeValue: false },
  initAsync: false,
});

export async function changeLocale(locale: Locale): Promise<void> {
  await i18n.changeLanguage(locale);
  document.documentElement.lang = locale;
}
