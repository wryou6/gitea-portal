# Tasks: 多位經手人的頭像提示

**Input**: `specs/028-assignee-avatar-groups/` 的 spec、plan、research、data-model 與 contracts。
**Tests**: 不新增測試框架或 Gitea mutation；Storybook stories 是視覺驗收入口。依專案要求執行 workspace typecheck、build 及 Storybook build。

## Phase 1: User Story 1 - 快速辨認 Issue 經手團隊 (P1)

**Independent Test**: 三個 view 顯示相同主要人員與有序小頭像；單人、多人、overflow、Done 與未指派均可在 Storybook 重現。

- [X] T001 [US1] 從 `UserIdentity` 抽出支援 16px 與現有尺寸、保留破圖 fallback 的 `UserAvatar`，並維持 `UserIdentity` 對外行為，更新 `apps/web/src/components/ui/UserIdentity.tsx` 與新增的 `apps/web/src/components/ui/UserAvatar.tsx`。
- [X] T002 [US1] 新增有序主要人員／其他人員解析 helper 與可及 `AssigneeIdentityGroup`：主要人員＋姓名、最多兩個 16px 額外頭像、精確 `+N`、完整姓名/login 群組提示，支援三語，修改 `apps/web/src/lib/assignee-display.ts`、`apps/web/src/components/ui/AssigneeIdentityGroup.tsx`、`apps/web/src/i18n/resources/common.ts` 與 `apps/web/src/index.css`。
- [X] T003 [US1] 將共用人員群組接入 Issue List、Kanban、Gantt，維持 open currentOwner、Done 首位保留人員、未指派與既有排序，修改 `apps/web/src/features/issues/IssueRow.tsx`、`apps/web/src/features/work-views/KanbanCard.tsx`、`apps/web/src/features/work-views/GanttIssueRow.tsx`。
- [X] T004 [US1] 加入單人／多人／overflow／Done／缺圖 Storybook fixtures 與三個 view 的案例，並驗證 Gantt 表頭欄位對齊，修改 `apps/web/src/stories/fixtures.ts`、`apps/web/src/features/issues/IssueRow.stories.tsx`、`apps/web/src/features/work-views/KanbanCard.stories.tsx`、`apps/web/src/features/work-views/GanttIssueRow.stories.tsx`、`apps/web/src/features/work-views/GanttBoard.stories.tsx`。

## Phase 2: Responsive, accessibility, and validation

- [X] T005 [P] 覆核 spec、data model、contract、checklist 與 quickstart 一致性；必要時修正 feature 文件。
- [X] T006 [US1] 執行 `pnpm.cmd typecheck`、`pnpm.cmd build`、`pnpm.cmd --filter @gitea-portal/web build-storybook`，並在 Storybook 覆核三語、明暗主題、1440／720／375 CSS px 呈現；將證據記入 `specs/028-assignee-avatar-groups/quickstart.md`。

## Dependencies & Execution Order

T001 → T002 → T003 → T004 → T005 → T006。三個 view 共用新元件，整合與 Storybook 驗收依此順序進行。

## Implementation Strategy

先保留單人 `UserIdentity` 行為並建立 avatar primitive，再建立完整可及人員群組；依序整合三個 view，以 Storybook 核對窄版及 Gantt 欄寬，再執行程式檢查。
