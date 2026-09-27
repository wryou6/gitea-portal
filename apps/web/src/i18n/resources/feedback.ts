import { defineLocaleResource } from "./define-locale-resource";

export const feedback = defineLocaleResource({
  "zh-TW": {
    loading: "載入中…",
    empty: "沒有資料",
    permissionDenied: "沒有權限",
    permissionDeniedDescription: "目前的 Gitea 帳號無法執行這項操作。",
  },
  en: {
    loading: "Loading…",
    empty: "No data",
    permissionDenied: "Permission denied",
    permissionDeniedDescription: "Your current Gitea account cannot perform this action.",
  },
  ja: {
    loading: "読み込み中…",
    empty: "データがありません",
    permissionDenied: "権限がありません",
    permissionDeniedDescription: "現在の Gitea アカウントではこの操作を実行できません。",
  },
});
