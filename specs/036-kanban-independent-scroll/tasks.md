# Tasks: Kanban 欄位獨立捲動

**Input**: Design documents from `/specs/036-kanban-independent-scroll/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated tests were requested. Preserve and extend Storybook examples for manual viewport and interaction review; run the required Web typecheck and build during polish.

## Phase 1: Setup

No project setup is required; reuse the current pnpm workspace and Web app.

## Phase 2: Foundational

No shared infrastructure or data contract changes are required.

## Phase 3: User Story 1 - 分別瀏覽各狀態欄 (Priority: P1) 🎯 MVP

**Goal**: Independently scroll each status and anomaly card list while keeping each column heading and count visible.

**Independent Test**: With long lists in multiple columns, scroll each card-list region and confirm only that region moves; verify keyboard focus/scrolling and heading association.

### Implementation

- [X] T001 [US1] Wrap the cards and empty message in a named, keyboard-focusable scroll region associated with the translated column heading in `apps/web/src/features/work-views/KanbanColumn.tsx`.
- [X] T002 [US1] Make `.kanban-column` a bounded flex column with a fixed heading and independently scrollable card-list region, including visible focus styling, in `apps/web/src/index.css`.
- [X] T003 [P] [US1] Extend the Kanban Storybook fixture with enough cards to exercise independent scrolling across statuses and the Anomaly column in `apps/web/src/features/work-views/KanbanBoard.stories.tsx`.

**Checkpoint**: Each status and anomaly list can scroll independently and remains accessible by keyboard.

## Phase 4: User Story 2 - 在固定視窗內操作 Kanban (Priority: P1)

**Goal**: Keep Kanban within the viewport without page-level vertical scrolling; preserve horizontal board browsing and the narrow-screen lane picker.

**Independent Test**: Review All repos and Repository Kanban on desktop and at the existing 720px breakpoint with long card lists. Confirm no page vertical scroll, desktop horizontal browsing, and internal scroll in the selected narrow-screen lane.

### Implementation

- [X] T004 [US2] Constrain Kanban board and Kanban-only work-view content to the available height, disable shared content vertical scrolling only for Kanban, and retain horizontal overflow in `apps/web/src/index.css`.
- [X] T005 [US2] Adjust the narrow-screen board and selected column to fill the available height beneath the lane picker while retaining the existing single-lane selection behavior in `apps/web/src/index.css`.
- [X] T006 [US2] Add an opt-in narrow-screen filter disclosure in `apps/web/src/features/work-views/WorkViewLayout.tsx` and enable it only for Kanban in `apps/web/src/features/work-views/KanbanBoard.tsx`; start collapsed on narrow screens, preserve filter state, and keep desktop filters visible.
- [X] T007 [P] [US2] Add localized expand/collapse labels for the narrow Kanban filters in zh-TW, English, and Japanese in `apps/web/src/i18n/resources/work-views.ts`.
- [X] T008 [US2] Add a narrow-screen long-list Storybook scenario that verifies the collapsed filter state, expand/collapse behavior, retained filters, lane selection, and internal scrolling in `apps/web/src/features/work-views/KanbanBoard.stories.tsx`.

**Checkpoint**: Desktop and narrow Kanban layouts remain viewport-contained; horizontal browsing, lane selection, and card transitions still work.

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verify the feature against the project quality gates and manual scenarios.

- [X] T009 Run `pnpm.cmd typecheck` and `pnpm.cmd build` from the repository root; resolve any regressions in the changed Web files.
- [X] T010 Review the scenarios in `specs/036-kanban-independent-scroll/quickstart.md` against the Storybook examples, including empty lanes, Anomaly behavior, focus visibility, filter disclosure, and drag/drop.

## Dependencies & Execution Order

### Phase Dependencies

- Setup and Foundational phases have no work; existing workspace infrastructure is reused.
- User Story 1 can begin immediately and is the MVP.
- User Story 2 layout work follows T002 because both stories change `apps/web/src/index.css`.
- Polish depends on both user stories.

### User Story Dependencies

- **US1 (P1)**: Independent; implements per-column scroll regions and accessibility.
- **US2 (P1)**: Builds on the per-column scroll region from US1 to constrain it to available viewport height.

### Parallel Opportunities

- T003 can run in parallel with T001/T002 because it modifies only the Storybook file.
- Within US2, T004 and T005 touch the same stylesheet and should be executed sequentially.
- T006/T007 add the localized mobile filter disclosure after the board layout; T008 follows them because its narrow-screen scenario exercises that behavior.

## Implementation Strategy

### MVP First

Complete T001-T003, then review the independent column behavior with the US1 Storybook fixture. Continue to US2 to ensure full viewport containment at desktop and narrow widths.

### Incremental Delivery

1. Complete US1 to give each column its own accessible scroll region.
2. Complete US2 to size the board and selected narrow-screen lane within the viewport.
3. Run required checks and the quickstart interaction review.
