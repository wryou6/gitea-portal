# Implementation Plan: Issue Type 呈現統一

**Branch**: `main` | **Date**: 2026-09-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/009-issue-type-presentation/spec.md`

## Summary

所有 Issue Type 使用同一套標籤樣式與名稱，放在清單、詳情、Kanban 與甘特圖標題區；建立與編輯表單保留原生選擇器並套用所選類型的視覺語意。以共用 Type 顯示元件、語意化的淺色／深色 CSS tokens 及 Storybook 情境 stories 實現。只改 Web UI，不改 Gitea Label、API、domain contract 或 persistence。

## Technical Context

**Language/Version**: TypeScript 5.8、React 19

**Primary Dependencies**: 現有 `@gitea-portal/domain`、React、Tailwind CSS 4（應用畫面以 `index.css` 元件類別為主）、Storybook 8；不新增套件

**Storage**: N/A；Type 仍從現有 Gitea Labels 推導

**Testing**: Storybook 視覺情境與建置；`pnpm.cmd typecheck`、`pnpm.cmd build`。本規格未要求新增自動化測試。

**Target Platform**: 響應式 Web，支援現有淺色與深色主題

**Project Type**: pnpm monorepo Web frontend；本 feature 僅修改 `apps/web`

**Performance Goals**: 純同步標籤呈現，不新增請求或大型依賴

**Constraints**: 保留 Gitea 為唯一資料來源；Issue list/detail 的完整 Labels 仍可辨認；Kanban workflow labels 過濾、repair/error 標記與狀態操作維持原樣；標籤不可只靠顏色傳遞語意

**Scale/Scope**: 三種有效 Type、未設定／衝突狀態；Issue list/detail、Kanban、Gantt 及 create/edit Type 欄位

## Constitution Check

`.specify/memory/constitution.md` 目前只有未填寫的範本，沒有可執行的專案原則，因此 Constitution gate 無已定義條款可判違規。依 repo `AGENTS.md` 檢查：

- **PASS**：不新增 Type persistence、API 或 Gitea 操作；Source of Truth 維持 Gitea。
- **PASS**：Issue list/detail 的一般 Labels 維持完整可辨認；Type 以鄰近標題的 badge 表達，避免在一般 Labels 中重複顯示。
- **PASS**：Kanban workflow labels、repair annotation、錯誤、drag transition 不變。
- **PASS**：UI 變更後執行 `pnpm.cmd typecheck` 與 `pnpm.cmd build`。

## Project Structure

### Documentation (this feature)

```text
specs/009-issue-type-presentation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

No `contracts/` directory is needed because the feature changes no external or internal API contract.

### Source Code (repository root)

```text
apps/web/src/
├── components/ui/
│   └── IssueTypeBadge.tsx
├── features/issues/
│   ├── IssueTypeField.tsx
│   ├── IssueRow.tsx
│   ├── IssueDetailHeader.tsx
│   ├── IssueCreatePage.tsx
│   ├── IssueEditForm.tsx
│   ├── LabelList.tsx
│   └── *.stories.tsx
├── features/boards/
│   ├── KanbanCard.tsx
│   ├── GanttBoard.tsx
│   ├── GanttIssueRow.tsx
│   └── *.stories.tsx
└── index.css
```

**Structure Decision**: 共用純呈現 badge 放在 `components/ui`；與 IssueType/domain 語意耦合的表單欄位放在 `features/issues`；Gantt row 抽成可單獨呈現與 Storybook 驗證的 board 子元件。既有頁面整合該元件，不新增 package 或 API layer。

## Implementation Decisions

- `IssueTypeBadge` 接收已推導的 Type 與 labels 狀態，統一呈現有效類型、未設定及衝突；使用可見文字加固定樣式，不以 icon 或顏色取代文字。
- 以 CSS semantic variables 定義 Bug 紅、Feature 藍、Task 綠及 anomaly 琥珀／紅的前景、底色、邊框，為 `.dark` 提供配對值；badge 文字對比至少 4.5:1。badge 內文字 `white-space: nowrap`，外層集合允許換行。
- Issue list/detail 將有效 Type badge 放入標題區、一般 metadata 之前；一般 Label 區不重複顯示已由 badge 表達的有效 Type，其他 Labels 全保留。異常 Type 顯示明確狀態與可辨認的衝突類型值，不錯選一個有效類型。
- Kanban card 與 Gantt row 在標題區顯示相同 badge；Gantt 的已排程、未排程與日期異常 Issue 都有 Type 呈現。Kanban 繼續只在 UI 隱藏由 badge 取代的 Type label，不改 API 的 `visibleLabels` 或 convention 過濾。
- `IssueTypeField` 保留現有原生 `<select>` 與 label/keyboard semantics；選項使用 `Bug`、`Feature`、`Task` 直接名稱，選中值套用對應顏色語意，不建立自訂 listbox。
- Storybook 加入共用 badge/selector，以及 Issue row、detail header、Kanban card、Gantt row 的有效／異常類型情境；使用既有 theme toolbar 檢查 light/dark。

## Complexity Tracking

No constitution violations or added architectural complexity.
