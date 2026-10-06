# Implementation Plan: 跨檢視逾期日期提示

**Branch**: `037-overdue-date-alerts` | **Date**: 2026-10-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/037-overdue-date-alerts/spec.md`

## Summary

在 Issue List、Kanban、Gantt 與 Issue 詳情呈現同一個逾期狀態。前端以 Gitea Issue 的 open/closed state、有效 due date 和瀏覽器本地日曆日即時計算，不改變 API、Gitea 資料、排序或篩選。所有檢視使用共用的紅色圓形火焰圖示，不顯示文字，並保留翻譯後的無障礙名稱；Gantt 在標題旁使用緊湊版本。

## Technical Context

**Language/Version**: TypeScript 5.8、Node.js 22、React 19

**Primary Dependencies**: React、react-i18next、既有 Gitea Portal domain 日期驗證

**Storage**: 無；逾期是由現有 Issue 欄位計算的呈現狀態

**Testing**: 既有 Storybook 情境、手動跨 view 驗收、`pnpm.cmd typecheck`、`pnpm.cmd build`；不新增測試框架

**Target Platform**: Portal 支援的桌面及窄螢幕瀏覽器

**Project Type**: pnpm workspace 中的 React/Vite Web UI

**Performance Goals**: 每筆已載入 Issue 以常數時間檢查狀態與日期，不增加網路請求或載入步驟

**Constraints**: 逾期判斷只在 Web 呈現；Gitea 為 Issue 唯一來源；使用本地日曆日；支援語系的文字與無障礙名稱須一致；保留排序、篩選、日期異常及窄螢幕可辨識度

**Scale/Scope**: 已載入的 Issue List、Kanban、Gantt 與 Issue 詳情；不增加資料量、儲存或 API 合約

## Constitution Check

*Gate before Phase 0*: PASS — 此功能只讀取既有 Issue 欄位作為 UI 派生狀態，不建立 Issue mirror 或 Portal persistence；不操作 Gitea 寫入；保留目前使用者權限；使用 i18n 資源顯示所有使用者可見文字。

*Post-design*: PASS — 設計沒有 API/domain contract、資料持久化、權限或 Gitea mutation 變更；UI 變更以 typecheck、build 和視覺驗收確認。

## Project Structure

### Documentation

```text
specs/037-overdue-date-alerts/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

No `contracts/` artifact is needed because this feature adds no external or cross-package interface.

### Source Code

```text
apps/web/src/features/issues/
  IssueRow.tsx
  IssueDetailHeader.tsx
  ScheduleDates.tsx
  OverdueIndicator.tsx        # shared localized visual indicator
  overdue-date.ts             # shared pure date/state predicate
apps/web/src/features/work-views/
  KanbanCard.tsx
  GanttIssueRow.tsx
  gantt-timeline.ts           # existing browser-local calendar date source
apps/web/src/i18n/resources/issues.ts
apps/web/src/index.css
```

**Structure Decision**: Keep the pure overdue predicate and reusable indicator beside issue scheduling UI; use them from the existing Issue and work-view components. Continue using the existing `gantt-timeline.ts` local-calendar-date value for Gantt rendering, and allow deterministic date input to the shared predicate for Storybook cases.

## Complexity Tracking

No constitution violations or additional project complexity.
