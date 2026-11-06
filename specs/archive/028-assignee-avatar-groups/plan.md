# Implementation Plan: 多位經手人的頭像提示

**Branch**: `028-assignee-avatar-groups` | **Date**: 2026-10-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/028-assignee-avatar-groups/spec.md`

## Summary

在 Issue List、Kanban、Gantt 共用主要人員與其他經手人的緊湊呈現：主要人員維持頭像和姓名，其後最多接兩個小頭像，更多以 `+N` 收納。以既有有序 Assignees 與 UserProfiles 還原名單，提供完整可及名稱和 hover 提示。不新增 API、資料請求、持久化或 Gitea 寫入。

## Technical Context

**Language/Version**: TypeScript 5.8、React 19、Node.js 22
**Primary Dependencies**: 現有 React UI 元件、i18next、Storybook 8.6
**Storage**: N/A；沿用 Issue `assignees`、`currentOwner`、`assignee` 與 `userProfiles`
**Testing**: `pnpm.cmd typecheck`、`pnpm.cmd build`、`pnpm.cmd --filter @gitea-portal/web build-storybook`；用 Storybook 驗收三個 view 的多語、主題及視窗寬度
**Target Platform**: 內網瀏覽器 Web app；桌面、平板與窄螢幕
**Project Type**: pnpm workspace React Web app
**Performance Goals**: 不新增網路請求；每筆人員群組最多呈現三張頭像
**Constraints**: Gitea 是人員資料唯一來源；維持主要人員語意、Gitea 順序、姓名帳號辨識與 Gantt 欄位對齊
**Scale/Scope**: Issue List、Kanban、Gantt；zh-TW、en、ja；light/dark；1440、720、375 CSS px

## Constitution Check

- **PASS — Gitea 唯一資料來源**：唯讀呈現既有 Assignees 與 UserProfiles，不新增資料副本。
- **PASS — 權限與完整性**：不增加 Gitea 查詢或寫入，不變更 Issue 狀態、指派、篩選或排序。
- **PASS — 跨 Repository 正確性**：人員仍以 login 關聯，不以姓名合併身份。
- **PASS — 多語與可及性**：群組標籤支援三語；完整人名與帳號可由鍵盤及輔助科技取得。
- **PASS — UI 品質**：共用元件並為 List、Kanban、Gantt 加入虛構多人的 Storybook 案例。

## Research Decisions

見 [research.md](research.md)：保留各 view 的主要人員規則；按 Gitea 有序名單去重；顯示主要人員頭像與姓名，後接最多兩個 16px 頭像，剩餘數量用 `+N`；完整有序名單放在人員群組的 hover 提示及可及名稱中。

## Data and Contracts

- [data-model.md](data-model.md)：沿用既有資料，不新增 entity 或 API 欄位。
- [contracts/assignee-avatar-group.md](contracts/assignee-avatar-group.md)：定義主要人員、尾隨頭像、溢出計數、無人員與可及性契約。
- [quickstart.md](quickstart.md)：定義 workspace checks 與三個 view 的 Storybook 驗收。

## Project Structure

### Documentation

```text
specs/028-assignee-avatar-groups/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/assignee-avatar-group.md
├── quickstart.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code

```text
apps/web/src/components/ui/UserAvatar.tsx
apps/web/src/components/ui/AssigneeIdentityGroup.tsx
apps/web/src/components/ui/UserIdentity.tsx
apps/web/src/lib/assignee-display.ts
apps/web/src/features/issues/IssueRow.tsx
apps/web/src/features/work-views/KanbanCard.tsx
apps/web/src/features/work-views/GanttIssueRow.tsx
apps/web/src/i18n/resources/common.ts
apps/web/src/index.css
apps/web/src/features/issues/IssueRow.stories.tsx
apps/web/src/features/work-views/KanbanCard.stories.tsx
apps/web/src/features/work-views/GanttIssueRow.stories.tsx
```

**Structure Decision**: 在 `components/ui` 共用呈現元件，在 `lib` 共用人員排序規則，三個 view 僅負責傳入各自既有的主要人員與名單。

## Validation

完成任務後依 `tasks.md` 與 [quickstart.md](quickstart.md) 驗收。Storybook 使用虛構資料；本功能不得觸發 Gitea mutation 或額外 API 查詢。
