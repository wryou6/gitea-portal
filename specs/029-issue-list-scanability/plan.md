# Implementation Plan: Issue list 欄位與預設排序調整

**Branch**: `029-issue-list-scanability` | **Date**: 2026-10-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/029-issue-list-scanability/spec.md`

## Summary

調整 Issue list 的產品預設：Key 欄隱藏但保留為可選欄位，排序改為 Due Date 升冪。All repos 在每筆 Title 下方顯示 `owner/repo`，Repository 工作區沿用頁面標題辨識來源。更新只作用於沒有既存個人偏好及使用者恢復預設的情況；舊偏好與明確 URL 排序保留。沿用現有 Issue 搜尋排序及日期空值置後、Key 升冪平手規則，不新增 API、Gitea 寫入或資料遷移。

## Technical Context

**Language/Version**: TypeScript 5.8、React 19

**Primary Dependencies**: `@gitea-portal/web`、React、react-i18next；沿用既有 API Issue sort contract

**Storage**: 現有依登入帳號區分的瀏覽器偏好 cookie；不新增儲存欄位或資料來源

**Testing**: `pnpm.cmd typecheck`、`pnpm.cmd build`；Storybook 檢視預設、舊偏好、URL 覆寫與 View Options 操作

**Target Platform**: Portal 支援的桌面與窄版瀏覽器

**Project Type**: pnpm workspace Web application with API

**Performance Goals**: 不新增網路請求或增加 Issue 載入步驟；沿用既有排序與分頁成本

**Constraints**: 不變更 Gitea Issue；保留個人已保存的欄位與排序；明確 URL 排序優先；Key 可重新顯示且 Title 維持必顯；All repos 每筆 Issue 顯示 Repository 身分

**Scale/Scope**: All repos 與 Repository Issue list；偏好仍依登入帳號共用

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Gitea 是 Issue 資料的唯一來源**: PASS — 僅改唯讀清單呈現偏好，不複製或寫入 Issue 資料。
- **II–V. 權限、原子寫入、聚合完整性及 Status 語意**: PASS — 不改 API 權限、Issue 請求範圍、Gitea 寫入或 Status 行為。
- **VI. 工作範圍與資料來源清楚可辨**: PASS — All repos 每筆 Title 下方顯示 `owner/repo`；Repository 工作區標題辨識來源；Key 可由使用者重新顯示。
- **VII. 多語系**: PASS — 不新增使用者可見文字；既有 Key 欄位選項與翻譯沿用。
- **Development Process**: PASS — 維護 spec/plan/tasks/analyze，實作後執行 typecheck 與 build。

## Project Structure

### Documentation (this feature)

```text
specs/029-issue-list-scanability/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/web/src/features/issues/
├── issue-view-preference.ts
├── IssueViewOptionsDialog.tsx
├── IssueListPage.tsx
├── IssueRow.tsx
└── IssueListPage.stories.tsx

apps/api/src/issues/issue-search-service.ts  # Existing sort behavior; expected unchanged
```

**Structure Decision**: 維持既有 Web/API workspace 分層。本功能的行為變更只在 Web Issue list 偏好及呈現；API 搜尋服務提供的 Due Date 比較、空值置後與 Key tie-break 已符合需求，不需新增對外 contract。

## Phase 0: Outline & Research

- 確認 Issue view preference 的既有預設、驗證與帳號偏好讀寫行為。
- 確認 URL sort 優先於個人預設，以及 API 對 Due Date 空值置後、同值以 Key 升冪排序。
- 確認無外部介面或新資料模型需求；不建立 `contracts/`。

## Phase 1: Design & Contracts

- 調整產品預設 visible fields，移除 Key 但保留 Title；允許有效偏好不包含 Key，讓 View Options 可切換其可見性。
- 將 All repos 的 Repository 身分以次要文字放在每筆 Title 下方；單一 Repository 清單使用既有工作區標題，不重複增加欄位。
- 將無偏好預設與恢復預設的排序設為 `dueDate asc`，沿用舊 cookie 內容和 URL 優先順序。
- 更新 Storybook 狀態與驗收指南，涵蓋新預設、舊偏好、URL 排序、欄位恢復及日期平手／空值順序。
- 不新增 API contract；偏好資料形狀不變，無需版本升級或遷移。

## Complexity Tracking

無憲章例外或額外架構複雜度。
