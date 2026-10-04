# Tasks: 工作檢視篩選列版面

**Input**: Design documents from `/specs/035-work-view-filter-layout/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: No new automated tests requested in the specification. Preserve and review existing Storybook examples; run the project's required typecheck and build during Polish.

## Phase 1: Setup

**Purpose**: No project setup is required; this feature reuses the existing Web workspace, dependencies, and design tokens.

No setup tasks.

---

## Phase 2: Foundational

**Purpose**: No new shared infrastructure or data contract is required. Implement the layout through the existing shared work-view components.

No foundational tasks.

---

## Phase 3: User Story 1 - 從主要內容上方篩選工作 (Priority: P1)

**Goal**: Show the same single-row common filter arrangement above List, Kanban, and Gantt while preserving all existing filtering and URL behavior.

**Independent Test**: Open all three work views in All repos and a single Repository; confirm assignee, status, priority, and type appear in that order on one desktop row, and changing/clearing filters preserves the matching results and URL behavior.

- [X] T001 [US1] Add a shared top-filter content region above the result summary in `apps/web/src/features/work-views/WorkViewLayout.tsx`, retaining the existing controls region and summary behavior.
- [X] T002 [US1] Separate the recent-done visibility control from common filter presentation in `apps/web/src/features/work-views/WorkViewFilterBar.tsx` while preserving its existing state callback and accessible label.
- [X] T003 [US1] Arrange assignee shortcuts/selector, status, priority, and issue type in that order on one compact desktop row, with each choice label inline before its options, in `apps/web/src/features/work-views/WorkViewFilterBar.tsx`; keep clear-filter and active-filter chips available.
- [X] T004 [US1] Connect the common filter region and retained recent-done/page controls through `apps/web/src/features/issues/IssueListPage.tsx`, `apps/web/src/features/work-views/KanbanBoard.tsx`, and `apps/web/src/features/work-views/GanttBoard.tsx`; update direct layout consumers in `apps/web/src/features/work-views/KanbanBoard.stories.tsx` and `apps/web/src/features/work-views/GanttBoard.stories.tsx` without changing filter callbacks or URL state.

---

## Phase 4: User Story 2 - 快速辨識並操作篩選條件 (Priority: P1)

**Goal**: Keep the single desktop filter row compact and visually light while maintaining localization, keyboard access, and narrow-screen usability.

**Independent Test**: Review the shared filter presentation for all three work views in Traditional Chinese, English, and Japanese at desktop and narrow widths; confirm subtle group separation, visible keyboard focus, accessible selection state, and no horizontal overflow.

- [X] T005 [US2] Style the shared filter region as one compact desktop row, keep each choice group on one line, use subtle spacing without an oversized background panel, and allow narrow-width wrapping in `apps/web/src/index.css`.
- [X] T006 [P] [US2] Update the shared filter layout examples to show the ordered single row, selected values, and narrow/localized variants in `apps/web/src/features/work-views/WorkViewFilterBar.stories.tsx`.
- [X] T007 [US2] Review and update affected Traditional Chinese, English, and Japanese filter labels in `apps/web/src/i18n/resources/work-views.ts`; retain keyboard and `aria-pressed` semantics in `apps/web/src/features/work-views/WorkViewFilterBar.tsx`.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verify the shared layout integration and project-required UI quality gates.

- [X] T008 Run `pnpm.cmd typecheck` and `pnpm.cmd build` from the workspace scripts in `package.json`; resolve feature-related failures and review `git diff --check`.
- [X] T009 Review `specs/035-work-view-filter-layout/quickstart.md` against the rendered views in `apps/web/src/features/issues/IssueListPage.tsx`, `apps/web/src/features/work-views/KanbanBoard.tsx`, and `apps/web/src/features/work-views/GanttBoard.tsx`, including existing filter/URL behavior, localized narrow layouts, keyboard focus, and retained view controls.

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No work required; existing workspace is used.
- **Phase 2 (Foundational)**: No work required; no blocking infrastructure is added.
- **Phase 3 (US1)**: Can begin immediately; T001–T003 establish the shared structure before T004 connects each view.
- **Phase 4 (US2)**: Depends on Phase 3's rendered filter layout; T005 and T006 can proceed in parallel after the shared structure exists. T007 preserves existing localization and accessibility behavior.
- **Phase 5 (Polish)**: Depends on both user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Independent; establishes consistent filter location and preserved behavior.
- **US2 (P1)**: Builds on the shared rendering introduced by US1 to refine visual and responsive usability.

### Parallel Opportunities

- T006 (Storybook presentation) can proceed in parallel with T005 after the shared filter structure is available.
- Localization review in T007 can proceed alongside styling, provided the filter labels and accessible semantics are not changed by another task.

## Implementation Strategy

### MVP First

Complete T001–T004 to move and arrange the common filters in all three work views while preserving existing behavior. Then complete T005–T007 for the specified light visual treatment, responsive behavior, and localized/accessibility review.

### Incremental Delivery

Validate US1 across List, Kanban, and Gantt before applying US2 visual refinements. Run project-required validation only after shared changes are integrated.

## Notes

- Every implementation task names the affected file path; tasks are ordered by shared layout dependency.
- No API, persistence, domain model, or new dependency work is included.
- Automated test-authoring tasks are omitted because the specification did not request a new test suite.
