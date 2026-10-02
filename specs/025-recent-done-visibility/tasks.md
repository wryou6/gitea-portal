---
description: "Task list for recent Done visibility and complete Issue List"
---

# Tasks: 最近完成項目範圍與完整 Issue List

**Input**: Design documents from `specs/025-recent-done-visibility/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/issues-list-unpaginated.md`

**Tests**: No automated test tasks are included because the feature request did not explicitly request them. Repository-required typecheck/build are included in Polish; `quickstart.md` documents manual scenarios for a later interactive walkthrough.

## Phase 1: Setup

**Purpose**: No new project setup is needed; this feature extends the existing pnpm workspace.

## Phase 2: Foundational

**Purpose**: Carry Gitea completion timestamps through the shared issue model before applying the filter.

- [X] T001 [P] Add nullable `closed_at` normalization to `packages/gitea-contracts/src/gitea.ts` and `apps/api/src/gitea/client.ts`.
- [X] T002 Add nullable `closedAt` to `packages/domain/src/issue.ts` and map the normalized value in `apps/api/src/issues/issue-service.ts`.
- [X] T003 Add nullable `closedAt` to the Web `Issue` response type in `apps/web/src/lib/api.ts`.

**Checkpoint**: Gitea `closed_at` is available in the shared Web issue model.

## Phase 3: User Story 1 - 管理完成項目的顯示範圍 (Priority: P1)

**Goal**: Default to recent Done items in all work views, allow showing all Done items, and make the active range visible in the upper-left result summary.

**Independent Test**: In All repos and a single Repository, verify the checked default, 30-local-calendar-day boundary, all-Done toggle, upper-left count and date-condition summary, unaffected non-Done items, and reset after navigation/reload in Issues List, Kanban, and Gantt.

- [X] T004 [P] [US1] Implement a shared recent-Done date predicate in `apps/web/src/features/work-views/work-view-filters.ts` using local calendar dates and nullable `closedAt`.
- [X] T005 [P] [US1] Add localized accessible recent-Done checkbox and completion-condition summary strings for zh-TW, en, and ja in `apps/web/src/features/work-views/WorkViewFilterBar.tsx` and `apps/web/src/i18n/resources/work-views.ts`.
- [X] T006 [US1] Add page-local checked-by-default toggle state and upper-left result count/condition summary to Issues List in `apps/web/src/features/issues/IssueListPage.tsx`; reset on reload/navigation and keep the toggle out of URL and persisted preferences.
- [X] T007 [US1] Wire page-local toggle state, shared filtering, and upper-left count/condition summary through `apps/web/src/features/work-views/WorkspaceViewPage.tsx`, `apps/web/src/features/work-views/KanbanBoard.tsx`, and `apps/web/src/features/work-views/GanttBoard.tsx`; preserve other filters and reset on reload/navigation.
- [X] T008 [P] [US1] Add Storybook examples for checked recent-only, unchecked all-Done, date-boundary, missing timestamp, and upper-left summary states in `apps/web/src/features/work-views/WorkViewFilterBar.stories.tsx`, `apps/web/src/features/work-views/KanbanBoard.stories.tsx`, and `apps/web/src/features/work-views/GanttBoard.stories.tsx`.

**Checkpoint**: All three work views show the correct Done range, and the upper-left summary explains the active date condition and result count.

## Phase 4: User Story 2 - 完整瀏覽 Issue List (Priority: P1)

**Goal**: Show the complete filtered and sorted Issue List in one continuous list without pagination.

**Independent Test**: With more than 50 matches in All repos and a single Repository, verify every sorted match is shown, filters work, and there are no page controls.

- [X] T009 Return every sorted matching Issue from `apps/api/src/issues/issue-search-service.ts` and remove page metadata from `packages/gitea-contracts/src/portal.ts`, preserving all-pages Gitea reads and fail-whole-request behavior.
- [X] T010 Remove Issue List page state and navigation in `apps/web/src/features/issues/issue-list-state.ts`, `apps/web/src/features/issues/IssueListPage.tsx`, and `apps/web/src/features/work-views/WorkViewLayout.tsx`; render the complete returned set, preserve sorting/filters, and treat existing `page` URL values as the full list.
- [X] T011 [P] [US2] Add an Issue List Storybook scenario with more than 50 rows and no pagination in `apps/web/src/features/issues/IssueListPage.stories.tsx`.

**Checkpoint**: Issue List shows the complete sorted matching set without page controls.

## Phase 5: Polish

**Purpose**: Align manual validation guidance and run required repository checks.

- [X] T012 Update `specs/025-recent-done-visibility/quickstart.md` to reflect the implemented upper-left summary, checkbox, and unpaginated Issue List behavior.
- [X] T013 Run `pnpm.cmd typecheck` and `pnpm.cmd build` from the repository root; resolve any failures caused by this feature.

## Dependencies & Execution Order

- Phase 1 requires no work.
- Phase 2 blocks both user stories because the shared model must include `closedAt`.
- Phase 3 depends on Phase 2. T004 and T005 provide shared filtering/control primitives before T006 and T007 integrate each view.
- Phase 4 depends on the existing full read-through and may be implemented after Phase 3 to keep the planned story order.
- Phase 5 depends on both user stories.

## Implementation Strategy

Complete the shared completion-time contract first, then deliver the recent-Done experience across all views, followed by complete Issue List rendering. Finish with the manual quickstart and repository-required typecheck/build.
