# Implementation Plan: Issue 排程日期呈現改善

**Branch**: `011-issue-schedule-presentation` | **Date**: 2026-09-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/011-issue-schedule-presentation/spec.md`

## Summary

在現有 Issue 與 Board 畫面共用排程日期呈現：使用「開始」／「到期」、`YYYY/MM/DD`、語意化日期元素與明確的缺值／異常狀態。開始日期的內部 Label 從一般 Labels 區隱藏，日期仍顯示在專用欄位。維持現有 Gitea 日期來源、API contract 和寫入行為。

## Technical Context

**Language/Version**: TypeScript 5.8.2、React 19

**Primary Dependencies**: 現有 React、CSS custom properties/Tailwind CSS 4 pipeline、Storybook 8.6；不新增相依套件。

**Storage**: N/A；沿用 API 提供的 `Issue.startDate` 與 `Issue.dueDate`，不新增或複製資料。

**Testing**: Storybook story review（含淺色／深色與窄視窗）、`pnpm.cmd typecheck`、`pnpm.cmd build`、`pnpm.cmd --filter @gitea-portal/web build-storybook`。

**Target Platform**: 現有 Portal Web 瀏覽器介面；桌面與 375 px 窄視窗。

**Project Type**: pnpm workspace 中的 React/Vite Web 前端。

**Performance Goals**: 只格式化目前已載入的日期字串，不新增 API 呼叫或非同步工作。

**Constraints**: 日期是 `YYYY-MM-DD` 日曆字串；顯示時不得經過可能改變日曆日的瀏覽器時區轉換。不得改變 Gitea source of truth、日期寫入、日期解析或 Gantt 排程資料。

**Scale/Scope**: Issue 清單、Issue 詳情、Kanban 卡片、Gantt 列，以及 Issue 建立／編輯日期欄位；不擴充其他 Issue metadata。

## Constitution Check

`.specify/memory/constitution.md` 仍是未填寫的模板，沒有已 ratify 的專案原則可作 gate。本計畫遵守 repository `AGENTS.md`：不新增 persistence/API contract，沿用 Gitea 日期資料，保留其他 Labels，使用繁體中文，完成後執行 Web typecheck 與 build。

**Gate**: PASS。使用者明確要求不暴露開始日期的內部 Label；一般 Labels 顯示只略過 `start-date:`，專用日期欄位仍呈現該日期，其他 Labels 保持可見。這是日期呈現的明確例外，不改動 Issue 資料來源。

## Project Structure

### Documentation (this feature)

```text
specs/011-issue-schedule-presentation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/web/src/features/issues/
├── ScheduleDates.tsx                 # 共用唯讀日期呈現
├── ScheduleDateFields.tsx            # 建立／編輯表單共用日期欄位
├── issueLabelPresentation.ts         # 過濾只供功能內部使用的 Labels
├── IssueRow.tsx
├── IssueDetailHeader.tsx
├── IssueCreatePage.tsx
├── IssueEditForm.tsx
└── *.stories.tsx                     # 日期呈現與欄位狀態

apps/web/src/features/boards/
├── KanbanCard.tsx
├── GanttBoard.tsx
├── GanttIssueRow.tsx
└── *.stories.tsx                     # Kanban/Gantt 日期狀態

apps/web/src/index.css                # 共用日期呈現與響應式樣式
```

**Structure Decision**: 重用 `features/issues` 下的日期呈現與輸入元件，供 Issue 與 Board feature 共用；Board 專有日期軸與排程列仍留在 `features/boards`。不新增 domain model 或資料層模組。

## Design and Data Flow

1. `ScheduleDates` 接收現有 `startDate`、`dueDate` 與排程異常資訊，顯示兩個具「開始」「到期」標籤的日期欄位；日期以 `time` 的 `dateTime` 保存原始日曆值，文字格式為 `YYYY/MM/DD`。
2. 格式化時先驗證 `YYYY-MM-DD` 是有效日曆日期，再以字串分段輸出，不以本地時區解析日期。缺值顯示「未設定」；無效或重複的來源日期顯示欄位異常，不任選或暴露原始 Label 字串；倒序日期保留兩個日期並顯示既有異常提示。
3. Issue Row、Detail Header、Kanban Card、Gantt Issue Row 共用 `ScheduleDates`。Gantt bar 仍使用既有單日／區間計算；日期文字分別顯示開始與到期，避免把單日重複格式化成 `日期 — 日期`。無日期列仍在未排程區，並顯示兩個未設定欄位。
4. 一般 Label 的呈現透過 `issueLabelPresentation.ts` 排除既有 Type Label 與 `start-date:` Label；Issue Type 判讀仍使用原始 `issue.labels`，所有其他一般 Labels 保持可見。建立／編輯表單保留原生日期輸入與現有資料流，只統一欄位名稱、清除按鈕名稱及版面。
5. Storybook 涵蓋雙日期、單一開始日期、單一到期日期、雙欄缺值與日期異常，並由共用元件 story 驗證兩種主題和窄版排版；Gantt row 與 Kanban card 的 stories 檢查其實際整合呈現。

## API and Contract Impact

無。`Issue.startDate`、`Issue.dueDate`、`scheduleStatus` 與 `scheduleAnomaly` 沿用既有型別；不修改 API、Gitea Label、Issue mutation 或 Board persistence。

## Validation Gates

- `pnpm.cmd typecheck` 與 `pnpm.cmd build` 通過。
- `pnpm.cmd --filter @gitea-portal/web build-storybook` 通過。
- Storybook 確認四種日期狀態、一般 Labels 不含原始開始日期 Label、Issue Type 呈現未受影響。
- 在 375 px 與桌面寬度、淺色與深色主題檢視日期標籤、值、異常提示及換行；確認鍵盤／螢幕閱讀順序由開始到到期。
- 表單仍能設定及清除日期；使用原有 Gitea mutation/reload 流程，不新增寫入路徑。

## Constitution Check (Post-Design)

**Gate**: PASS。設計只改 Web 呈現與 Storybook 案例；無新 workspace、資料儲存、API contract 或 Gitea 權限變更。其他 Labels 與 Issue Type 原始資料仍保留，日期資料仍以 Gitea 為準。

## Complexity Tracking

無 gate violation；不新增服務、資料庫或依賴套件。
