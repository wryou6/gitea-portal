---
description: "Implementation tasks for shared work-view multi-select filters"
---

# Tasks: 工作檢視多選篩選

**Input**: Design documents from `specs/031-work-view-multiselect/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/work-view-multiselect.md`, `quickstart.md`

**Tests**: The specification calls for Storybook scenarios and workspace validation, not a new automated test suite.

**Organization**: Tasks are grouped by user story; shared state and URL semantics are foundational prerequisites.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and has no unmet dependency.
- **[Story]**: User story label from `spec.md`.
- Every task names its target file path.

## Phase 1: Setup

**Purpose**: Reuse the current pnpm workspace, filter components, API, i18n resources, and Storybook setup.

No setup tasks.

---

## Phase 2: Foundational

**Purpose**: Establish multi-value state, validation, serialization, and shared match semantics before view controls and API integration.

- [X] T001 Convert `WorkViewFilters` Priority, Issue Type, and Status fields to validated value sets; update parse/serialize, deduplication, empty-set defaults, active-filter counting, and shared matcher in `apps/web/src/features/work-views/work-view-filters.ts`.
- [X] T002 Preserve repeated Priority, Issue Type, and Status query values and validate each value independently during cross-view navigation and URL sanitization in `apps/web/src/features/work-views/work-view-url-state.ts`.

**Checkpoint**: All views can read the same validated multi-select URL state and apply OR-within/AND-across matching semantics.

---

## Phase 3: User Story 1 - 快速篩選未完成工作 (Priority: P1) 🎯 MVP

**Goal**: Provide the unfinished Status preset and independently selectable Status options.

**Independent Test**: Select Unfinished, confirm Todo and In Progress are selected and Done is not, remove In Progress, then select Unfinished again and confirm it resets the pair.

### Implementation for User Story 1

- [X] T003 Add independently toggleable Status Badges, an Unfinished shortcut that replaces the Status set with Todo and In Progress, an All reset, pressed-state accessibility, and individual Status chips in `apps/web/src/features/work-views/WorkViewFilterBar.tsx` and `apps/web/src/features/work-views/work-view-filter-labels.ts` (depends on T001).
- [X] T004 Add localized Unfinished text and accessible names in `apps/web/src/i18n/resources/work-views.ts` (depends on T003).
- [X] T005 Add Storybook scenarios for selecting/resetting Unfinished and removing one Status in `apps/web/src/features/work-views/WorkViewFilterBar.stories.tsx` (depends on T003, T004).

**Checkpoint**: The Unfinished shortcut maps to the two underlying selected Statuses; individual Status changes immediately update the shared filter state.

---

## Phase 4: User Story 2 - 複選狀態、優先級與類型 (Priority: P1)

**Goal**: Support multiple Priority and Type selections and apply shared OR/AND semantics to all work views and List results.

**Independent Test**: Select multiple Priorities and Types, then Status and Assignee; confirm any selected value matches within each category and all active categories intersect.

### Implementation for User Story 2

- [X] T006 Make existing Priority and Type Badge choices independently toggleable, provide category-level All reset and per-value removable chips, and preserve Status behavior in `apps/web/src/features/work-views/WorkViewFilterBar.tsx` and `apps/web/src/features/work-views/work-view-filter-labels.ts` (depends on T001, T003).
- [X] T007 Parse repeated `priority`, `issueType`, and `state` parameters and apply OR within each category and AND across categories to the complete result in `apps/api/src/issues/issue-routes.ts`, `apps/api/src/gitea/client.ts`, and `apps/api/src/issues/issue-search-service.ts` (depends on T001).
- [X] T008 Encode each selected List filter as a repeated query parameter and remove individual values from List filter state in `apps/web/src/lib/api.ts` and `apps/web/src/features/issues/issue-list-state.ts` (depends on T001, T007).
- [X] T009 Update the List, Kanban, and Gantt filter stories and fixtures to demonstrate multiple Priority, Type, and Status values plus combined category matching in `apps/web/src/features/issues/IssueListPage.stories.tsx`, `apps/web/src/features/work-views/KanbanBoard.stories.tsx`, `apps/web/src/features/work-views/GanttBoard.stories.tsx`, and `apps/web/src/features/work-views/WorkViewFilterBar.stories.tsx` (depends on T006, T007, T008).

**Checkpoint**: Priority, Type, and Status multi-selects yield equivalent results in List, Kanban, and Gantt; removing a selected value preserves the other selections.

---

## Phase 5: User Story 3 - 跨工作檢視還原多選條件 (Priority: P2)

**Goal**: Restore and preserve all valid repeated filter values through URL reload and view navigation.

**Independent Test**: Open a URL containing repeated valid and invalid values, change filters several times, use browser back/forward, switch across all three views, reload, and confirm valid selections and matching results restore at each step.

### Implementation for User Story 3

- [X] T010 Create a browser history entry for each filter change and restore the matching selection/results on `popstate` in `apps/web/src/features/issues/issue-list-state.ts`, `apps/web/src/features/work-views/KanbanBoard.tsx`, and `apps/web/src/features/work-views/GanttBoard.tsx` (depends on T002, T008).
- [X] T011 Add Storybook coverage for repeated URL restoration, invalid sibling values, and retained multi-selects across List/Kanban/Gantt in `apps/web/src/features/work-views/WorkViewFilterBar.stories.tsx`, `apps/web/src/features/work-views/KanbanBoard.stories.tsx`, and `apps/web/src/features/work-views/GanttBoard.stories.tsx` (depends on T009, T010).
- [X] T012 Confirm applied-filter summaries, clear-all behavior, and empty-state result counts handle value sets across all three view integrations in `apps/web/src/features/issues/IssueListPage.tsx`, `apps/web/src/features/work-views/KanbanBoard.tsx`, and `apps/web/src/features/work-views/GanttBoard.tsx` (depends on T006, T008, T009). The shared work-view summary uses a value-qualified React key for repeated category entries.

**Checkpoint**: Shared filter sets survive reload and cross-view navigation; summaries and empty states describe the filtered result.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify accessible presentation, responsive layout, localization, and the complete workspace build.

- [X] T013 Review multi-select pressed/focus states and narrow layout in `apps/web/src/index.css`; update affected zh-TW, en, and ja strings in `apps/web/src/i18n/resources/work-views.ts` and `apps/web/src/i18n/resources/issues.ts`.
- [X] T014 Run `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd --filter @gitea-portal/web build-storybook`; resolve failures in the owning files and record actual outcomes in `specs/031-work-view-multiselect/quickstart.md`.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Existing workspace and tooling; no work required.
- **Foundational (Phase 2)**: T001 and T002 establish shared state and URL semantics; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on the filter state from Phase 2.
- **User Story 2 (Phase 4)**: Depends on Phase 2 and the shared Status component established in T003.
- **User Story 3 (Phase 5)**: Depends on multi-value state, API/List integration, and all view stories; history synchronization is implemented before its navigation coverage.
- **Polish (Phase 6)**: Depends on all three user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2; delivers the Unfinished Status shortcut.
- **US2 (P1)**: Starts after T001 and T003; extends the same filter controls and adds API List matching.
- **US3 (P2)**: Starts after T002 and US2; implements history restoration and verifies it across all views.

### Parallel Opportunities

- T001 and T002 touch separate filter modules and may proceed in parallel after contract agreement.
- After Phase 2, T007 can proceed in parallel with T003/T004 because it edits API files while US1 edits web files.
- T008 depends on T007's request contract; T009 follows UI and API integration.

## Implementation Strategy

### MVP First (User Story 1)

1. Complete T001-T002.
2. Complete T003-T005.
3. Demonstrate Unfinished selection and individual Status removal in Storybook.

### Incremental Delivery

1. Complete the shared model and URL handling.
2. Deliver US1 shortcut behavior.
3. Deliver US2 Priority/Type multi-select and API List matching.
4. Deliver US3 URL restoration across views.
5. Complete responsive/accessibility review and run required workspace builds.

## Notes

- Tasks do not add a new automated test suite; deterministic Storybook coverage and the specified validation commands are the feature checks.
- The Gitea Issue source, authorization boundary, and write paths remain unchanged.
