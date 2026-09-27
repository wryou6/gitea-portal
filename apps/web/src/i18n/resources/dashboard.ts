import { defineLocaleResource } from "./define-locale-resource";

export const dashboard = defineLocaleResource({
  "zh-TW": {
    eyebrow: "工作區總覽",
    title: "Dashboard",
    description: "瀏覽所有目前可存取的 Repository 工作區與跨庫看板。",
    listLabel: "所有可用工作區",
    repository: "Repository 工作區",
    board: "跨庫看板",
    empty: "目前沒有可用的工作區。",
    loadError: "工作區清單無法載入。",
    retry: "重試",
  },
  en: {
    eyebrow: "WORKSPACES",
    title: "Dashboard",
    description: "Browse all Repository workspaces and cross-repository boards you can access.",
    listLabel: "All available workspaces",
    repository: "Repository workspace",
    board: "Cross-repository board",
    empty: "No workspaces are currently available.",
    loadError: "Could not load the workspace directory.",
    retry: "Retry",
  },
  ja: {
    eyebrow: "ワークスペース一覧",
    title: "ダッシュボード",
    description: "アクセス可能なリポジトリのワークスペースと横断ボードを表示します。",
    listLabel: "利用可能なすべてのワークスペース",
    repository: "リポジトリのワークスペース",
    board: "リポジトリ横断ボード",
    empty: "現在利用できるワークスペースはありません。",
    loadError: "ワークスペース一覧を読み込めませんでした。",
    retry: "再試行",
  },
});
