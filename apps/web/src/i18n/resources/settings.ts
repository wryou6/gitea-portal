import type { Locale } from "../locales";

export const settings: Record<
  Locale,
  {
    title: string;
    appearance: string;
    currentAccount: string;
    appearanceMode: string;
    light: string;
    dark: string;
    system: string;
    lightDescription: string;
    darkDescription: string;
    systemDescription: string;
    currentMode: string;
    language: string;
    languageDescription: string;
    statusMigrationTitle: string;
    statusMigrationDescription: string;
    statusMigrationStart: string;
    statusMigrationRunning: string;
    statusMigrationFailed: string;
    statusMigrationVerified: string;
    statusMigrationIncomplete: string;
    statusMigrationCounts: string;
    statusMigrationSuccesses: string;
    statusMigrationIssueMigrated: string;
    statusMigrationIssueUnchanged: string;
    statusMigrationConflicts: string;
    statusMigrationConflictValues: string;
    statusMigrationFailures: string;
  }
> = {
  "zh-TW": {
    title: "設定",
    appearance: "外觀",
    currentAccount: "目前帳號：{{login}}",
    appearanceMode: "外觀模式",
    light: "淺色",
    dark: "深色",
    system: "系統",
    lightDescription: "使用淺色外觀",
    darkDescription: "使用深色外觀",
    systemDescription: "依作業系統設定",
    currentMode: "目前模式：{{mode}}",
    language: "介面語言",
    languageDescription: "選擇 Portal 的顯示語言",
    statusMigrationTitle: "Issue Status 標籤遷移",
    statusMigrationDescription: "掃描目前 admin 可存取的所有 Repository，將舊 Status 標籤遷移為新的 Status 標籤並驗證完整範圍。發生中斷時可重新執行。",
    statusMigrationStart: "開始或重試遷移",
    statusMigrationRunning: "正在掃描與遷移…",
    statusMigrationFailed: "Issue Status 標籤遷移失敗",
    statusMigrationVerified: "完整範圍驗證成功，可移除舊標籤相容程式。",
    statusMigrationIncomplete: "尚未完成完整範圍驗證；請先處理下列項目，再重新執行。",
    statusMigrationCounts: "Repository：{{repositories}}；Issue：{{issues}}；已遷移：{{migrated}}；未變更：{{unchanged}}",
    statusMigrationSuccesses: "成功 Issue（{{count}}）",
    statusMigrationIssueMigrated: "已遷移",
    statusMigrationIssueUnchanged: "已符合新格式，未變更",
    statusMigrationConflicts: "依新標籤優先規則處理的衝突",
    statusMigrationConflictValues: "移除 {{removed}}；保留 {{retained}}",
    statusMigrationFailures: "失敗項目",
  },
  en: {
    title: "Settings",
    appearance: "Appearance",
    currentAccount: "Signed in as {{login}}",
    appearanceMode: "Appearance mode",
    light: "Light",
    dark: "Dark",
    system: "System",
    lightDescription: "Use the light appearance",
    darkDescription: "Use the dark appearance",
    systemDescription: "Follow your operating system",
    currentMode: "Current mode: {{mode}}",
    language: "Interface language",
    languageDescription: "Choose the display language for Portal",
    statusMigrationTitle: "Issue Status label migration",
    statusMigrationDescription: "Scan all repositories accessible to admin, migrate legacy Status labels to the current Status labels, and verify the full scope. Rerun after an interruption to resume.",
    statusMigrationStart: "Start or retry migration",
    statusMigrationRunning: "Scanning and migrating…",
    statusMigrationFailed: "Issue Status label migration failed",
    statusMigrationVerified: "Full-scope verification succeeded. Legacy label compatibility can be removed.",
    statusMigrationIncomplete: "Full-scope verification is incomplete. Resolve the items below and rerun.",
    statusMigrationCounts: "Repositories: {{repositories}}; Issues: {{issues}}; migrated: {{migrated}}; unchanged: {{unchanged}}",
    statusMigrationSuccesses: "Successful Issues ({{count}})",
    statusMigrationIssueMigrated: "Migrated",
    statusMigrationIssueUnchanged: "Already current; unchanged",
    statusMigrationConflicts: "Conflicts resolved using the new-label precedence rule",
    statusMigrationConflictValues: "removed {{removed}}; retained {{retained}}",
    statusMigrationFailures: "Failures",
  },
  ja: {
    title: "設定",
    appearance: "外観",
    currentAccount: "現在のアカウント：{{login}}",
    appearanceMode: "外観モード",
    light: "ライト",
    dark: "ダーク",
    system: "システム",
    lightDescription: "ライトテーマを使用",
    darkDescription: "ダークテーマを使用",
    systemDescription: "OS の設定に従う",
    currentMode: "現在のモード：{{mode}}",
    language: "表示言語",
    languageDescription: "Portal の表示言語を選択",
    statusMigrationTitle: "Issue Status ラベルの移行",
    statusMigrationDescription: "admin がアクセスできるすべての Repository を走査し、旧 Status ラベルを新しい Status ラベルへ移行して全範囲を検証します。中断した場合は再実行できます。",
    statusMigrationStart: "移行を開始または再試行",
    statusMigrationRunning: "走査と移行中…",
    statusMigrationFailed: "Issue Status ラベルの移行に失敗しました",
    statusMigrationVerified: "全範囲の検証に成功しました。旧ラベル互換コードを削除できます。",
    statusMigrationIncomplete: "全範囲の検証が未完了です。以下を解決して再実行してください。",
    statusMigrationCounts: "Repository：{{repositories}}；Issue：{{issues}}；移行済み：{{migrated}}；変更なし：{{unchanged}}",
    statusMigrationSuccesses: "成功した Issue（{{count}}）",
    statusMigrationIssueMigrated: "移行済み",
    statusMigrationIssueUnchanged: "新形式のため変更なし",
    statusMigrationConflicts: "新しいラベルを優先して解決した競合",
    statusMigrationConflictValues: "削除：{{removed}}；保持：{{retained}}",
    statusMigrationFailures: "失敗項目",
  },
};
