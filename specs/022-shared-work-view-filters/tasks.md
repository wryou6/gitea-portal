---
description: "Task list for shared work-view filters and global search"
---

# Tasks: 工作檢視共用篩選與全域搜尋

**Input**: Design documents from `specs/022-shared-work-view-filters/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/work-view-search-and-filter.md`

**Tests**: No automated test suite was requested. Storybook stories and the manual scenarios in `quickstart.md` are required feature deliverables; typecheck/build checks are in the final phase.

**Organization**: Tasks are grouped by user story so each feature slice can be implemented and reviewed against its independent acceptance criteria.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and has no unmet dependency.
- **[Story]**: User story label from `spec.md`.
- Every implementation task names its target file path.

## Phase 1: Setup

**Purpose**: Reuse existing pnpm workspace, i18n resources, UI primitives, and Storybook configuration. No package or infrastructure setup is required.

No setup tasks.

---

## Phase 2: Foundational

**Purpose**: Define one URL-backed filter model and matching rule before integrating view-specific controls.

- [X] T001 Create `WorkViewFilters`, URL parsing/serialization, invalid-value normalization, active-filter counting, and shared Issue matcher in `apps/web/src/features/work-views/work-view-filters.ts`.

**Checkpoint**: All view-specific work can consume the same typed values and matching semantics.

---

## Phase 3: User Story 1 - 在各工作檢視使用相同篩選 (Priority: P1) 🎯 MVP

**Goal**: Add visible Priority, Type, Status, and Assignee filters that apply immediately and produce the same Issue set across List, Kanban, and Gantt.

**Independent Test**: Set two or more common filters and move through List, Kanban, and Gantt; confirm matching results and removable active chips in each view.

### Implementation for User Story 1

- [X] T002 [P] [US1] Add Priority and Issue Type query parsing in `apps/api/src/issues/issue-routes.ts`, query fields in `apps/api/src/gitea/client.ts`, and pre-pagination filtering in `apps/api/src/issues/issue-search-service.ts`.
- [X] T003 [P] [US1] Build the common Priority, Type, Status, Assignee controls and removable active-filter chips in `apps/web/src/features/work-views/WorkViewFilterBar.tsx`.
- [X] T004 [US1] Replace the List-only filter form with `WorkViewFilterBar` and immediate filter loading in `apps/web/src/features/issues/IssueListPage.tsx` and `apps/web/src/features/issues/issue-list-state.ts` (depends on T002, T003).
- [X] T005 [P] [US1] Integrate the common filters into Kanban and Gantt, apply the shared matcher to complete Issue sets, and remove Gantt Open/Closed and Assignee controls in `apps/web/src/features/work-views/KanbanBoard.tsx` and `apps/web/src/features/work-views/GanttBoard.tsx` (depends on T003).
- [X] T006 [US1] Add fixture-based common-filter stories for List, Kanban, and Gantt in `apps/web/src/features/work-views/WorkViewFilterBar.stories.tsx`, `apps/web/src/features/issues/IssueListPage.stories.tsx`, `apps/web/src/features/work-views/KanbanBoard.stories.tsx`, and `apps/web/src/features/work-views/GanttBoard.stories.tsx` (depends on T004, T005).

**Checkpoint**: The four common filters work in all three views and Gantt retains its date/scale controls.

---

## Phase 4: User Story 4 - 從頂部導覽搜尋所有 Issues (Priority: P1)

**Goal**: Search all readable repositories from every authenticated page using a top-bar result dropdown, regardless of the selected workspace.

**Independent Test**: From a Repository workspace, find an Issue in a different readable Repository, identify its repository in the dropdown, open it, and return to the originating page.

### Implementation for User Story 4

- [X] T007 [P] [US4] Build an accessible, debounced global Issue search dropdown with loading, empty, error, keyboard, and Escape states in `apps/web/src/components/layout/GlobalIssueSearch.tsx`.
- [X] T008 [US4] Integrate global search beside `WorkspaceSelector` in `apps/web/src/components/layout/AppShell.tsx` and use the all-readable-repository search query with `returnTo` links from `apps/web/src/lib/api.ts` and `apps/web/src/app/routes.ts` (depends on T007).
- [X] T009 [US4] Add fixture-based top-bar search stories for results, empty, loading, error, keyboard focus, and Repository identity in `apps/web/src/components/layout/GlobalIssueSearch.stories.tsx` (depends on T007).

**Checkpoint**: Search results cover all readable repositories, identify their source Repository, and return to the original route after Issue detail.

---

## Phase 5: User Story 2 - 展開進階篩選 (Prior implementation; superseded by Phase 9)

**Goal**: Keep Repository, Label, and Milestone filters collapsed by default while preserving and summarizing active values.

**Independent Test**: Configure advanced filters in All repos, collapse the section, switch views, and confirm the conditions remain active; verify Repository is fixed in a single-Repository workspace.

### Implementation for User Story 2

- [X] T010 [US2] Add the collapsed Advanced filters section, active-condition count, clear-all action, All repos Repository selector, Label and Milestone controls in `apps/web/src/features/work-views/WorkViewFilterBar.tsx` (depends on T003).
- [X] T011 [US2] Apply Repository, Label, and Milestone values to List API requests and the Kanban/Gantt shared matcher in `apps/web/src/features/issues/IssueListPage.tsx`, `apps/web/src/features/work-views/KanbanBoard.tsx`, and `apps/web/src/features/work-views/GanttBoard.tsx` (depends on T004, T005, T010).
- [X] T012 [US2] Add collapsed, expanded, active-count, and All repos/Repository workspace stories in `apps/web/src/features/work-views/WorkViewFilterBar.stories.tsx` (depends on T010, T011).

**Checkpoint**: Advanced filters remain applied while collapsed and behave consistently in all three views.

The tasks in this phase record the earlier implementation. The 2026-10-02 scope decision below removes these controls and makes the top workspace selector authoritative for Repository scope.

---

## Phase 6: User Story 3 - 還原或分享篩選結果 (Priority: P2)

**Goal**: Preserve valid shared filters in view URLs and when navigating among the three views in the current workspace.

**Independent Test**: Copy a filtered view URL, reopen it, and navigate between views; confirm workspace, view, and filter values are restored while Gantt date/scale values remain intact.

### Implementation for User Story 3

- [X] T013 [US3] Preserve shared filter query parameters on List/Kanban/Gantt sidebar links in `apps/web/src/components/layout/AppShell.tsx` without changing workspace or Create Issue navigation behavior (depends on T004, T005, T008, T011).
- [X] T014 [US3] Synchronize filter changes and restored filter state with existing List and Gantt URL parameters in `apps/web/src/features/work-views/work-view-filters.ts`, `apps/web/src/features/issues/IssueListPage.tsx`, `apps/web/src/features/issues/issue-list-state.ts`, and `apps/web/src/features/work-views/GanttBoard.tsx` (depends on T004, T005, T011, T013).
- [X] T015 [US3] Add URL restoration, invalid-value, view-navigation, and Gantt date/scale retention stories in `apps/web/src/features/work-views/WorkViewFilterBar.stories.tsx` and `apps/web/src/features/work-views/GanttBoard.stories.tsx` (depends on T014).

**Checkpoint**: Share/reload/back navigation restores valid conditions, and view navigation carries them without dropping Gantt-specific query state.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Finish localization, responsive presentation, accessibility review, and required validation.

- [X] T016 [P] Add and verify zh-TW, en, and ja labels, chips, search feedback, accessible names, and empty/error text in `apps/web/src/i18n/resources/common.ts`, `apps/web/src/i18n/resources/issues.ts`, and `apps/web/src/i18n/resources/work-views.ts`.
- [X] T017 [P] Style the shared filter bar and top-bar dropdown for 375px, tablet, and desktop without horizontal page overflow in `apps/web/src/index.css`.
- [X] T020 Simplify the Issues List, Kanban, and Gantt page headers to one compact, localized title matching the left navigation in All repos, without eyebrow or subtitle in `apps/web/src/components/layout/PageHeader.tsx`, `apps/web/src/features/issues/IssueListPage.tsx`, `apps/web/src/features/work-views/KanbanBoard.tsx`, `apps/web/src/i18n/resources/issues.ts`, and `apps/web/src/index.css`; align the view stories.
- [X] T021 移除 Issues List、Kanban 與 Gantt compact 頁首的可見標題及下方 margin，保留輔助工具可讀取的標題；在 1440×900 桌機 Storybook 確認三語頁首高度與下方 margin 均為 0，並完成 workspace typecheck 與 build。
- [X] T022 在 `WorkViewLayout.tsx` 與 `work-view-filter-labels.ts` 建立共用左側控制面板及純文字結果摘要；串接 List、Kanban、Gantt，將日期、刻度與檢視操作移至面板，保留篩選網址、分頁、欄位偏好與狀態轉移行為，補齊三語文字與桌機明暗主題 stories。
- [X] T023 確認三檢視桌機版面、收合、篩選摘要、進階條件與檢視設定，並執行 workspace typecheck、build 及 Storybook build；在 `quickstart.md` 記錄實際驗證邊界。
- [ ] T018 Run `pnpm.cmd typecheck`, `pnpm.cmd build`, `pnpm.cmd --filter @gitea-portal/web build-storybook`, and scenarios in `specs/022-shared-work-view-filters/quickstart.md`; correct failures in their owning source files.

## Phase 8: Convergence

- [ ] T019 Run authenticated cross-Repository search, Issue detail return, and shared-filter navigation scenarios with a valid local Gitea session per SC-006 (partial).

## Phase 9: User Requested Scope Update (2026-10-02)

- [X] T024 Remove the Repository, Label, and Milestone advanced controls, URL parsing, and client-side matching from the shared work-view filter bar; retain Repository only as the internal scope for single-Repository Issue List reads.
- [X] T025 Make the top workspace selector authoritative by dropping legacy Repository, Label, and Milestone query values when switching workspaces or views; update the shared-filter story to cover ignored legacy values.
- [X] T026 Update the current specification, data model, contract, plan, and quickstart to document the reduced filter set and workspace scope behavior.
- [X] T027 Run the required workspace typecheck and production build, then review the final diff.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Reuses existing packages/configuration; no code task required.
- **Foundational (Phase 2)**: T001 defines the shared state and matcher; blocks all view integrations.
- **User Story 1 (Phase 3)**: Depends on T001; delivers the P1 filter-bar MVP.
- **User Story 4 (Phase 4)**: Depends on T001 and can proceed alongside US1 except for shared `AppShell` changes reserved for US3.
- **User Story 2 (Phase 5)**: Extends the filter bar and integrations from US1.
- **User Story 3 (Phase 6)**: Depends on all filter fields and AppShell global search integration to preserve URL state without file conflicts.
- **Polish (Phase 7)**: Depends on all four user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after T001; independent MVP.
- **US4 (P1)**: Starts after T001; global search can be implemented in parallel with US1's API and view files.
- **US2 (P2)**: Depends on US1's shared filter component and view integrations.
- **US3 (P2)**: Depends on US1/US2 filter keys and US4's AppShell integration.

### Parallel Opportunities

- T002 (API query filtering) and T003 (base filter UI) can run in parallel after T001.
- T004 (List integration) and T005 (Kanban/Gantt integration) can run in parallel after T003 and their API prerequisite.
- T007 (search dropdown component) can proceed independently of US1's API and view integration; T008 follows T007.
- T016 (locales) and T017 (responsive CSS) can run in parallel after story UI stabilizes.

## Parallel Example: User Story 1

```text
Task: T002 Extend API priority/type filtering in issue-routes.ts, client.ts, and issue-search-service.ts
Task: T003 Build WorkViewFilterBar.tsx with the four common filters and active chips
```

## Implementation Strategy

### MVP First (US1)

1. Complete T001 shared filter model and matcher.
2. Complete US1 tasks T002-T006.
3. Validate the four common conditions across List, Kanban, and Gantt.
4. Continue with US4 top-bar search, then advanced filters and URL-navigation refinements.

### Incremental Delivery

1. Deliver common filters across three views (US1).
2. Add global search dropdown across all readable repositories (US4).
3. Add collapsed advanced conditions (US2).
4. Complete URL navigation/restoration (US3).
5. Finish localization, responsive/theme review, and build/Storybook validation.

## Notes

- Tests are not added as separate test-suite tasks because the spec requested Storybook scenarios, not a new automated test suite.
- `[P]` marks tasks on separate files with no unmet dependencies; tasks editing `AppShell.tsx` are sequential.
- Every task is traceable to one user story and names its target source or documentation path.
