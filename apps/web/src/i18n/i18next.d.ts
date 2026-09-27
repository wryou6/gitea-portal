import "i18next";
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: Record<string, string>;
      settings: Record<string, string>;
      issues: Record<string, string>;
      boards: Record<string, string>;
      feedback: Record<string, string>;
      "api-errors": Record<string, string>;
    };
  }
}
