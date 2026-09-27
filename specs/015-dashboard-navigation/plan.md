# Implementation Plan: Dashboard 與共通工作介面

**Branch**: `015-dashboard-navigation` | **Date**: 2026-09-28 | **Spec**: [spec.md](spec.md)

**Input**: [Feature specification](spec.md)

## Summary

新增 Dashboard 作為根路徑與全站 Dashboard 連結的目的地，並列出使用者可讀取的 Repository 工作區及可讀取的跨庫看板。沿用現有 repositories/boards API、工作區可讀權限過濾與 React 頁面框架；不新增 API 或 Portal 持久化。共用頁首顯示不可點擊的 Gitea 圖示與 `Gitea Portal`，相鄰提供 Dashboard 連結；Dashboard、Kanban、Gantt 使用一致的頁面框架，移除 Repository Kanban/Gantt 專用的「回到 Repository Issues」操作。

## Technical Context

**Language/Version**: TypeScript 5.8、React 19；Node.js 22、pnpm 9 workspace。

**Primary Dependencies**: React、react-i18next、既有 `api` client、Vite；不新增 runtime dependency。

**Storage**: N/A。工作區清單即時讀取既有 API；不新增 Portal store 或 Issue mirror。

**Testing**: `pnpm.cmd typecheck`、`pnpm.cmd build`；依 AGENTS.md 的 UI 驗證要求執行。手動驗證 Dashboard/導覽與 Repository 及跨庫 Kanban/Gantt 的路由、載入失敗、空狀態、鍵盤及窄視窗。

**Target Platform**: 現有支援的桌面與窄視窗 Web 瀏覽器。

**Project Type**: pnpm monorepo web application (`apps/web`, `apps/api`, shared packages)。

**Performance Goals**: Dashboard 等待兩種工作區來源載入完成後顯示完整結果；不新增額外 Issue 查詢或逐工作區 N+1 請求。

**Constraints**: 延用登入使用者的 Gitea 委派權限；Board 僅在所含 Repository 全部可讀時列入 Dashboard；任一工作區來源失敗時顯示錯誤，不以部分結果冒充完整清單。保留既有路由相容性，根路徑改為 Dashboard。

**Scale/Scope**: 一個 Dashboard 頁面、一組共通頁首導覽、兩種既有工作區類型；只讀取 Repository 與 Board 清單，不讀取 Issue 清單。

## Constitution Check

**Gate before Phase 0**: 專案 Constitution 檔案仍是 Spec Kit 範本佔位文字，沒有已 ratify 的原則可作為 gate。依 repo `AGENTS.md` 檢查：維持既有 pnpm workspace、不新增 Issue persistence、尊重 Gitea 使用者權限、UI 文字採既有繁中/英文/日文資源、UI 變更後執行 typecheck/build；設計未違反以上限制。**Pass**。

**Gate after Phase 1**: 不增加 API contract、資料庫或持久化；Dashboard 只讀既有 API 並沿用工作區可讀權限過濾；舊路由維持可解析，`/` 導向新預設 Dashboard。頁面使用現有 i18n 與無障礙焦點樣式。**Pass**。

## Phase 0: Research Decisions

研究結果見 [research.md](research.md)。主要決策：以現有 Repository 與 Board list endpoints 組成唯讀工作區卡片；若任一來源失敗，不將不完整資料當作完整清單；根路徑為 Dashboard，`/issues` 繼續開啟全部 Issues；共通框架留在既有 AppShell，品牌標記使用本地向量圖示。

## Phase 1: Design

- [Data model](data-model.md)：定義 Dashboard 工作區項目作為呈現用 view model，不新增持久資料。
- [UI contract](contracts/ui-navigation.md)：定義路由、品牌、工作區範圍、頁首與失敗狀態。
- [Quickstart](quickstart.md)：列出建置與可手動重現的 Dashboard、導覽及錯誤狀態驗證。

## Project Structure

### Documentation (this feature)

```text
specs/015-dashboard-navigation/
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   └── ui-navigation.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/web/src/
├── app/
│   ├── App.tsx                         # Dashboard route rendering
│   └── routes.ts                       # /dashboard, /, and existing route resolution
├── components/layout/
│   └── AppShell.tsx                    # Gitea brand mark and global Dashboard link
├── features/dashboard/
│   └── DashboardPage.tsx               # Read-only workspace directory
├── public/favicon.svg                   # Local Gitea brand mark
├── index.html                           # Browser tab title
├── i18n/
│   ├── resources/common.ts              # Shared navigation labels, all locales
│   └── resources/dashboard.ts           # Dashboard content, all locales
├── features/boards/KanbanBoard.tsx      # Remove repository-specific return action
└── index.css                            # Shared header and workspace-card layout
```

**Structure Decision**: Keep the feature in the existing React web app. Dashboard is a route and page component; AppShell remains the shared navigation owner. Existing API handlers and contracts are reused without backend or shared-domain changes. Translation resources follow the existing three-locale resource convention.

## Complexity Tracking

None. No architecture boundary, dependency, persistence, or service is added.
