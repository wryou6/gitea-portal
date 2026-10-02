# Implementation Plan: 負責人快速篩選

**Branch**: `024-assignee-filter-shortcuts` | **Date**: 2026-10-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/024-assignee-filter-shortcuts/spec.md`

## Summary

讓 Portal 產生的預設 List、Kanban、Gantt 檢視連結明確帶 `assignee=me`，並提供「自己」與「所有負責人」快速按鈕。直接開啟缺少 assignee 的 URL 表示所有負責人；`me` 依目前登入者解析，實際 login 代表固定負責人。指定 login 使用可直接展開的 `<select>`；優先級、類型、狀態使用含「全部」的互斥選項按鈕組；所有篩選控制依序排列並可響應式換行。篩選仍只保存在瀏覽器檢視狀態，不寫入 Gitea。

## Technical Context

**Language/Version**: TypeScript 5.8.2、React 19

**Primary Dependencies**: 現有 React、react-i18next、URLSearchParams、Storybook；不新增相依套件

**Storage**: 篩選狀態僅存在 URL query 與頁面狀態；不新增 Portal persistence 或 Gitea 寫入

**Testing**: `pnpm.cmd typecheck`、`pnpm.cmd build`、`pnpm.cmd --filter @gitea-portal/web build-storybook`，並依 quickstart 驗證手動操作

**Target Platform**: 已登入的桌面與響應式 Web 工作檢視

**Project Type**: pnpm workspace Web application

**Performance Goals**: 快速切換後依現有行為立即更新篩選結果；本功能不新增網路請求

**Constraints**: 沿用 Gitea Issue 資料及使用者權限；登入者身分由既有 Portal session 提供；保留其他篩選及 Gantt query；`me` 在客戶端解析為 session login；新增文案支援繁中、英文、日文；缺少 assignee 一律代表 all

**Scale/Scope**: All repos 與 Repository 工作區的 Issues List、Kanban、Gantt，共六種檢視組合；改動限於共用負責人篩選行為

## Constitution Check

| 原則 | Gate | 結果 |
|---|---|---|
| I. Gitea 是 Issue 資料唯一來源 | 不複製或持久化 Issue/Assignee | PASS；只讀取既有 Issue 並在客戶端篩選 |
| II. 操作權限跟隨目前使用者 | 不新增或擴大 Gitea API 存取 | PASS；使用既有 session 身分與已可讀資料 |
| III. Gitea 寫入安全 | 不新增 Gitea 寫入 | PASS；快捷按鈕僅變更檢視條件 |
| IV. 跨來源彙整完整性 | 不更改聚合讀取或錯誤處理 | PASS；保留現有整體讀取失敗行為 |
| V. 固定 Issue Status | 不改變 Status 語意 | PASS |
| VI. 工作範圍可辨認 | 保留現有 workspace 與 Repository 範圍 | PASS |
| VII. 多語系 | 新增操作文案需三語且具可及性 | PASS；納入 i18n 與 Storybook 驗收 |

設計階段複核：無 constitution 違反，無需例外或複雜度豁免。

## Phase 0: Outline & Research

已確認目前 `/api/session` bootstrap 將 login 傳入 `App`；List 已收到 login，但 List parser 未使用。All repos 的 Kanban/Gantt 共用 `WorkspaceViewPage`、`KanbanBoard` 與 `WorkViewFilterBar`，尚未傳入 login。Repository 工作區也由 `App` 建立 `RepositoryWorkspacePage`，須將 login 傳入 List 與 Kanban/Gantt。

共用 `parseWorkViewFilters` 把缺少 assignee 解讀為 `all`；serializer 省略 `all`，把 `me` 寫入 query，並將實際 login 原樣寫入。Matcher 接收 session login 並以此解析 `me`。Issue List API 請求先把 `me` 解析成實際 login。Portal 在非工作檢視頁面建立預設檢視導覽連結時加入 `assignee=me`；檢視間切換保留既有 query，缺少 assignee 時仍代表 all。清除全部篩選回到 `me`；若負責人為 `me` 或 `all` 且沒有其他條件，清除按鈕停用。

技術調查與決策、替代方案及證據見 [research.md](research.md)。

## Phase 1: Design & Contracts

### Data Model

篩選是暫態檢視資料，由 URL 與現有檢視狀態保存；沒有新增資料庫或 API contract。欄位與 URL 語意詳見 [data-model.md](data-model.md)。

### UI Contract

優先級、類型、狀態及負責人快捷操作以互斥選項按鈕呈現，包含「全部」並以選取狀態清楚標示；負責人欄位另提供可直接展開的指定 login `<select>`。選取特定 login 後可直接展開更換，不需先清空；窄版依序換行且不產生水平捲動。所有 controls 可鍵盤操作並呈現選取狀態。完整互動契約見 [contracts/assignee-filter-controls.md](contracts/assignee-filter-controls.md)。

### Validation Guide

以 fixture Storybook 驗證 Portal 導覽預設 me、各按鈕組選取狀態、切換自己/所有人、保留其他條件、重設、三語與窄版顯示；以登入後手動情境確認六種檢視組合、優先級/類型/狀態直接切換、預設連結 `assignee=me`、直接無參數 URL 的 all 語意、選取 A 後展開下拉改選 B，以及 URL 還原。指令及步驟見 [quickstart.md](quickstart.md)。

## Project Structure

```text
specs/024-assignee-filter-shortcuts/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/assignee-filter-controls.md

apps/web/src/app/App.tsx
apps/web/src/components/layout/AppShell.tsx
apps/web/src/components/layout/WorkspaceSelector.tsx
apps/web/src/features/issues/IssueListPage.tsx
apps/web/src/features/issues/issue-list-state.ts
apps/web/src/features/repositories/RepositoryWorkspacePage.tsx
apps/web/src/features/work-views/WorkspaceViewPage.tsx
apps/web/src/features/work-views/KanbanBoard.tsx
apps/web/src/features/work-views/work-view-filters.ts
apps/web/src/features/work-views/WorkViewFilterBar.tsx
apps/web/src/features/work-views/WorkViewFilterBar.stories.tsx
apps/web/src/i18n/resources/work-views.ts
apps/web/src/index.css
```

**Structure Decision**: 沿用現有 React Web feature 模組；URL/parser/matcher 留在共用 work-views，List 與 Kanban/Gantt 入口負責注入同一個登入者 login，共用 FilterBar 實作按鈕及樣式。無 API、domain、Gitea contract 或 persistence 變更。
