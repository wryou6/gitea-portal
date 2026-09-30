# Tasks: Gantt 表格與日曆時間軸

**Input**: Design documents from `specs/019-gantt-table-timeline/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/gantt-view-url.md`, `quickstart.md`

**Tests**: No standalone test suite was requested. Storybook states and the validation commands in the quickstart are required for this UI feature.

**Organization**: Tasks are grouped by user story. Capture the existing visible-row baseline before UI changes; then establish shared date and preference helpers before the story phases.

## Phase 1: Setup

**Purpose**: Add reusable Gantt-specific view-state foundations without changing Issue or API data.

- [x] T001 Add a fixed 8-scheduled-Issue benchmark fixture to `apps/web/src/features/work-views/GanttBoard.stories.tsx`; at 1440×900 record the current initial-viewport row count in `specs/019-gantt-table-timeline/quickstart.md` before changing Gantt layout.
- [x] T002 [P] Add Gantt column preference type, allowed fields, defaults, validation, and login-scoped cookie read/write helpers in `apps/web/src/features/work-views/gantt-view-preference.ts`.
- [x] T003 [P] Add calendar-day arithmetic, scale parsing, calendar interval boundaries, and date-to-position helpers in `apps/web/src/features/work-views/gantt-timeline.ts`.

---

## Phase 2: Foundational

**Purpose**: Prepare shared Gantt presentation pieces required by the compact table and timeline.

- [x] T004 Add translated field labels and accessibility names needed by Gantt controls in `apps/web/src/i18n/resources/work-views.ts` for `zh-TW`, `en`, and `ja`.

**Checkpoint**: Gantt preference and date/scale helpers are available; no Issue/API persistence behavior has changed.

---

## Phase 3: User Story 1 - 精簡瀏覽 Gantt Issue (Priority: P1) 🎯 MVP

**Goal**: Replace tall Issue cards with compact table rows and an aligned timeline while retaining repository identity, Status, unscheduled issues, and date anomalies.

**Independent Test**: Open All repos and Repository Gantt with scheduled, single-date, unscheduled, and anomalous fixtures; verify the default three columns, shorter rows, repository identity, correct bars, and issue navigation.

### Implementation for User Story 1

- [x] T005 [US1] Refactor scheduled, unscheduled, and anomaly presentations into compact semantic Gantt table rows in `apps/web/src/features/work-views/GanttIssueRow.tsx`; show optional Type/Priority only when their columns are enabled, keep schedule dates in the timeline, and show Repository identity in All repos.
- [x] T006 [US1] Compose the default Title, Assignee, and Status columns with aligned per-Issue timeline tracks in `apps/web/src/features/work-views/GanttBoard.tsx`, preserving filters, Status labels, section counts, and Issue detail return paths.
- [x] T007 [P] Replace tall card styling with compact rows and a desktop table/timeline split; support synchronized horizontal timeline scrolling and a full horizontally scrollable narrow-screen chart in `apps/web/src/index.css`.
- [x] T008 [P] Add Gantt Storybook states for the compact default table, All repos identity, scheduled ranges, one-day items, unscheduled rows, and date anomalies in `apps/web/src/features/work-views/GanttBoard.stories.tsx` and `apps/web/src/features/work-views/GanttIssueRow.stories.tsx`.

---

## Phase 4: User Story 2 - 自訂 Gantt 表格欄位 (Priority: P1)

**Goal**: Allow account-scoped visibility and ordering for optional Gantt columns while keeping Title, Assignee, and Status visible and Gantt preferences separate from Issues preferences.

**Independent Test**: Toggle allowed optional columns, reorder with pointer and keyboard, save the default order, reload and switch Gantt workspaces, then restore defaults and verify Issues/account preferences remain isolated.

### Implementation for User Story 2

- [x] T009 [US2] Add a Gantt View Options dialog using existing Dialog and Checkbox primitives; list Type, Key, Priority, Created at, and Author while omitting Start Date and Due Date in `apps/web/src/features/work-views/GanttViewOptionsDialog.tsx`.
- [x] T010 [US2] Integrate Gantt preference loading, visible-column rendering, pointer and keyboard header reordering, save-default-order and restore-default toolbar actions in `apps/web/src/features/work-views/GanttBoard.tsx`.
- [x] T011 [P] [US2] Add translated Gantt View Options, fixed-column, save-order, restore-default, and reorder-announcement text in `apps/web/src/i18n/resources/work-views.ts` for `zh-TW`, `en`, and `ja`.
- [x] T012 [US2] Add Storybook states for visible optional fields, reorder pending, saved order, keyboard reorder, open View Options, and restored defaults in `apps/web/src/features/work-views/GanttBoard.stories.tsx`.

---

## Phase 5: User Story 3 - 調整與定位時間軸 (Priority: P1)

**Goal**: Add two-tier calendar headers, today and weekend cues, four calendar scales, an editable initial date, a Today reset, and shareable URL state.

**Independent Test**: Change date and scale, inspect Day/Week/2 weeks/Month boundaries, today/weekend markers, earlier-date scrolling, and verify reload/share preserves the same initial date and scale.

### Implementation for User Story 3

- [x] T013 [US3] Parse and update `gantt_start` and `gantt_scale` URL parameters with independent defaults and invalid-value fallback in `apps/web/src/features/work-views/GanttBoard.tsx`; preserve existing filters and both parameters in Issue detail `returnTo` links.
- [x] T014 [US3] Add the calendar start-date input, localized Today reset, and Day/Week/2 weeks/Month Scale selector beside the Gantt table in `apps/web/src/features/work-views/GanttBoard.tsx`.
- [x] T015 [P] Implement the two-tier calendar header, month/date or interval labels, today marker, and actual Saturday/Sunday shading in `apps/web/src/features/work-views/GanttCalendarHeader.tsx`.
- [x] T016 [US3] Position all scheduled bars on the shared calendar scale, initialize horizontal scroll to the selected date without clipping earlier dates, and keep unscheduled/anomaly rows aligned in `apps/web/src/features/work-views/GanttBoard.tsx`.
- [x] T017 [P] Style scale controls, two-tier headers, today/weekend states, fixed left table, horizontal scroll surfaces, and narrow layout in `apps/web/src/index.css`.
- [x] T018 [US3] Add translated scale names, calendar labels, Today, and non-color-only accessibility text for date and weekend markers in `apps/web/src/i18n/resources/work-views.ts` for `zh-TW`, `en`, and `ja`.
- [x] T019 [US3] Add Storybook states for all four scales, cross-month headers, today/weekend markers, custom initial date, narrow horizontal scrolling, and light/dark themes in `apps/web/src/features/work-views/GanttBoard.stories.tsx`.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the integrated feature against the UI, localization, accessibility, and URL requirements.

- [x] T020 Run Web typecheck and production build with `pnpm.cmd --filter @gitea-portal/web typecheck` and `pnpm.cmd --filter @gitea-portal/web build`; resolve any issues in the affected `apps/web/src/` files.
- [x] T021 Build and inspect Storybook using `pnpm.cmd --filter @gitea-portal/web build-storybook`; verify the Gantt stories in `apps/web/src/features/work-views/GanttBoard.stories.tsx` at desktop/narrow widths and light/dark themes.
- [x] T022 Complete the before/after visible-row comparison plus URL reload/share, account preference isolation, keyboard, and three-locale checks in `specs/019-gantt-table-timeline/quickstart.md`; record any failed scenario against its owning task.
- [x] T023 Fix Gantt Issue ordering by ascending start date, with due-date fallback for single-date items and stable Repository/Issue tie-breaking, in `apps/web/src/features/work-views/GanttBoard.tsx`.
- [x] T024 Constrain the Gantt workspace to the viewport and move vertical overflow into the chart so its bottom horizontal scrollbar remains visible; reduce row height in `apps/web/src/index.css` and `apps/web/src/features/work-views/KanbanBoard.tsx`.
- [x] T025 Add `ScrollableRows` and `KeyColumnVisible` Storybook stories and inspect long-list scroll behavior and Title/Key separation.
- [x] T026 Keep Title limited to the Issue title and render All repos owner/name in a separate Repository column; update the row Storybook fixture and spec/plan acceptance language.
- [x] T027 Rebuild Web and Storybook, then visually verify All repos shows Title and Repository separately while Repository-scoped Gantt omits the Repository column.
- [x] T028 Size Assignee and Status columns, plus All repos Repository, to their max-content widths and position Repository immediately before Title; verify both layouts in Storybook.
- [x] T029 Render the unscheduled group only when unscheduled Issues exist; add and inspect a long-list `NoUnscheduledIssues` Storybook story.
- [x] T030 Localize Gantt navigation, page headings, view options, date controls, calendar accessibility labels, and empty/error Storybook states in `zh-TW`, `en`, and `ja`; inspect the Gantt stories with each locale.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 records the baseline before any visual edits; then T002 and T003 can run in parallel.
- **Foundational (Phase 2)**: Depends on Setup; translation foundation is required before adding controls.
- **User Story 1 (Phase 3)**: Depends on Setup and Foundation; delivers the compact-row MVP.
- **User Story 2 (Phase 4)**: Depends on User Story 1's table/header composition.
- **User Story 3 (Phase 5)**: Depends on User Story 1 and User Story 2 because it integrates the shared Gantt table, toolbar, and row tracks.
- **Polish (Phase 6)**: Depends on all three user stories.

### User Story Dependencies

- **US1 (P1)**: Independent after Setup and Foundation; first MVP slice.
- **US2 (P1)**: Follows US1 because it adds preference-driven columns and toolbar actions to the shared table.
- **US3 (P1)**: Follows US1/US2 because calendar controls, shared scroll alignment, and dynamic columns integrate in `GanttBoard.tsx`.

### Parallel Opportunities

- T002 and T003 can be implemented in parallel in separate files after T001 captures the baseline.
- Within US1, T006 CSS and T007 stories can proceed alongside component work after the row contract is agreed.
- Within US3, T014 calendar header and T016 CSS are separate files; T017 translations are separate from those components.

## Parallel Example: User Story 3

```text
Task: "Implement the calendar header and weekend/today cues in apps/web/src/features/work-views/GanttCalendarHeader.tsx"
Task: "Add translated date, scale, and accessibility labels in apps/web/src/i18n/resources/work-views.ts"
Task: "Style calendar tracks and controls in apps/web/src/index.css"
```

## Implementation Strategy

### MVP First

1. Capture the baseline with T001 before any Gantt layout changes; then complete Setup and Foundation.
2. Implement US1 compact table rows with aligned schedule bars and preserved anomaly states.
3. Validate the compact default view in Storybook before adding preferences or new calendar controls.

### Incremental Delivery

1. Add US1 compact table/timeline rows.
2. Add US2 independent, account-scoped Gantt column preferences.
3. Add US3 URL-backed start date, scale, calendar headers, today and weekend cues.
4. Run the cross-cutting typecheck/build/Storybook and quickstart checks.

## Notes

- [P] marks tasks in separate files with no incomplete dependency.
- No API, domain, Gitea write, or new dependency changes are planned.
- Storybook is required by the requested design workflow; standalone unit/integration test tasks were not requested.
