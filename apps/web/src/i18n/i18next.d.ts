import "i18next";
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: Record<string, string>;
      dashboard: Record<string, string>;
      settings: Record<string, string>;
      auth: Record<string, string>;
      issues: Record<string, string>;
      "work-views": Record<string, string>;
      feedback: Record<string, string>;
      "api-errors": Record<string, string>;
    };
  }
}
