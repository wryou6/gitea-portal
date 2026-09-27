import { defineLocaleResource } from "./define-locale-resource";

export const dashboard = defineLocaleResource({
  "zh-TW": {
    eyebrow: "工作區總覽",
    title: "Dashboard",
    description: "瀏覽所有儲存庫與各個目前可讀取的 Repository 工作區。",
    listLabel: "所有可用工作區",
    repository: "Repository 工作區",
    allRepositories: "所有儲存庫",
    empty: "目前沒有可用的工作區。",
    loadError: "工作區清單無法載入。",
    retry: "重試",
  },
  en: {
    eyebrow: "WORKSPACES",
    title: "Dashboard",
    description: "Browse All repos and each Repository workspace you can access.",
    listLabel: "All available workspaces",
    repository: "Repository workspace",
    allRepositories: "All repos",
    empty: "No workspaces are currently available.",
    loadError: "Could not load the workspace directory.",
    retry: "Retry",
  },
  ja: {
    eyebrow: "ワークスペース一覧",
    title: "ダッシュボード",
    description: "すべてのリポジトリと、アクセス可能な各リポジトリのワークスペースを表示します。",
    listLabel: "利用可能なすべてのワークスペース",
    repository: "リポジトリのワークスペース",
    allRepositories: "すべてのリポジトリ",
    empty: "現在利用できるワークスペースはありません。",
    loadError: "ワークスペース一覧を読み込めませんでした。",
    retry: "再試行",
  },
});
