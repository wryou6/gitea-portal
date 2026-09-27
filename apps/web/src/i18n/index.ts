import i18next, { type i18n as I18nInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import { defaultLocale, type Locale } from "./locales";
import { apiErrors } from "./resources/api-errors";
import { workViews } from "./resources/work-views";
import { common } from "./resources/common";
import { dashboard } from "./resources/dashboard";
import { feedback } from "./resources/feedback";
import { issues } from "./resources/issues";
import { settings } from "./resources/settings";

export const resources = {
  "zh-TW": {
    common: common["zh-TW"],
    dashboard: dashboard["zh-TW"],
    settings: settings["zh-TW"],
    issues: issues["zh-TW"],
    "work-views": workViews["zh-TW"],
    feedback: feedback["zh-TW"],
    "api-errors": apiErrors["zh-TW"],
  },
  en: {
    common: common.en,
    dashboard: dashboard.en,
    settings: settings.en,
    issues: issues.en,
    "work-views": workViews.en,
    feedback: feedback.en,
    "api-errors": apiErrors.en,
  },
  ja: {
    common: common.ja,
    dashboard: dashboard.ja,
    settings: settings.ja,
    issues: issues.ja,
    "work-views": workViews.ja,
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
  ns: ["common", "dashboard", "settings", "issues", "work-views", "feedback", "api-errors"],
  interpolation: { escapeValue: false },
  initAsync: false,
});

export async function changeLocale(locale: Locale): Promise<void> {
  await i18n.changeLanguage(locale);
  document.documentElement.lang = locale;
}
