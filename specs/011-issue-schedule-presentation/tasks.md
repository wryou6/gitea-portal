# Tasks: Issue 排程日期呈現改善

**Input**: Design documents from `specs/011-issue-schedule-presentation/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: No separate automated test framework is requested. Storybook stories are required visual review cases; run the existing typecheck/build and Storybook build as validation.

**Organization**: Tasks are grouped by user story so each user-visible outcome can be reviewed independently.

## Phase 1: Setup

**Purpose**: The current Web workspace, design tokens and Storybook are already configured; no packages or infrastructure need setup.

No setup tasks.

## Phase 2: Foundational

**Purpose**: No cross-story API, domain or persistence change is needed. Each story uses the existing Issue schedule fields and status values.

No blocking foundation tasks.

## Phase 3: User Story 1 - 跨畫面辨識 Issue 排程日期 (Priority: P1)

**Goal**: Present both dates with consistent labels and format across Issue list/detail, Kanban and Gantt, including missing and anomalous states.

**Independent Test**: Review the `ScheduleDates`, Issue Row, Issue Detail Header, Kanban Card and Gantt Issue Row stories for both dates, start-only, due-only, no dates and invalid schedule. Verify a one-day Gantt item shows one date rather than a duplicate range.

### Implementation

- [X] T001 [US1] Create `ScheduleDates` in `apps/web/src/features/issues/ScheduleDates.tsx`; validate date-only values, format valid dates as `YYYY/MM/DD` without timezone conversion, expose `開始`/`到期` as labeled date values, and distinguish missing from anomalous values.
- [X] T002 [P] [US1] Add `apps/web/src/features/issues/ScheduleDates.stories.tsx` with both dates, start-only, due-only, no dates, invalid start, invalid due, and reversed-range examples.
- [X] T003 [US1] Integrate `ScheduleDates` into `apps/web/src/features/issues/IssueRow.tsx`, `apps/web/src/features/issues/IssueDetailHeader.tsx`, `apps/web/src/features/boards/KanbanCard.tsx`, and `apps/web/src/features/boards/GanttIssueRow.tsx`; update `apps/web/src/features/boards/GanttBoard.tsx` axis labels to `YYYY/MM/DD` and add responsive styles in `apps/web/src/index.css`.
- [X] T004 [US1] Extend `apps/web/src/features/issues/IssueRow.stories.tsx`, `apps/web/src/features/issues/IssueDetailHeader.stories.tsx`, `apps/web/src/features/boards/KanbanCard.stories.tsx`, and `apps/web/src/features/boards/GanttIssueRow.stories.tsx` with representative date states and verify the shared labels remain readable in their actual layouts.

**Checkpoint**: Every Issue/Board surface shows the same two date fields; Gantt keeps its existing range, single-day, unscheduled and anomaly behavior.

## Phase 4: User Story 2 - 設定日期而不暴露內部資料格式 (Priority: P1)

**Goal**: Keep create/edit date inputs clear and prevent internal Type/start-date Labels from appearing in general label lists while retaining all other Labels.

**Independent Test**: Inspect Create/Edit field stories and Issue/Board stories containing `start-date:YYYY-MM-DD`; confirm Chinese field names, clear controls, date display, hidden internal Labels and visible ordinary Labels.

### Implementation

- [X] T005 [P] [US2] Add `visibleIssueLabels` in `apps/web/src/features/issues/issueLabelPresentation.ts` to exclude `type:` and `start-date:` from presentation only; keep source `issue.labels` intact for Type parsing and mutations.
- [X] T006 [P] [US2] Create reusable native date inputs in `apps/web/src/features/issues/ScheduleDateFields.tsx` with「開始日期」「到期日期」labels and accessible clear controls for edit mode.
- [X] T007 [US2] Use `visibleIssueLabels` in `apps/web/src/features/issues/IssueRow.tsx`, `apps/web/src/features/issues/IssueDetailHeader.tsx`, and `apps/web/src/features/boards/KanbanCard.tsx`; preserve Issue Type parsing from the unfiltered labels.
- [X] T008 [US2] Replace duplicate date input markup in `apps/web/src/features/issues/IssueCreatePage.tsx` and `apps/web/src/features/issues/IssueEditForm.tsx` with `ScheduleDateFields`; retain existing state, submit payload and Gitea write behavior.
- [X] T009 [P] [US2] Add `apps/web/src/features/issues/ScheduleDateFields.stories.tsx` for create mode, populated edit mode and cleared values; include keyboard-focusable clear controls with descriptive names.
- [X] T010 [US2] Update `apps/web/src/features/issues/IssueRow.stories.tsx`, `apps/web/src/features/issues/IssueDetailHeader.stories.tsx`, and `apps/web/src/features/boards/KanbanCard.stories.tsx` to include internal start-date Labels and ordinary Labels; confirm only the internal Labels are omitted from the rendered lists.

**Checkpoint**: Users can set and clear dates through the same Gitea mutation flow; all intended dates remain visible without showing their backing Label string.

## Phase 5: Polish and Validation

**Purpose**: Confirm implementation against the visual states and responsive/accessibility requirements.

- [X] T011 Run `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd --filter @gitea-portal/web build-storybook` from the repository root; fix any issues in the relevant `apps/web` source files.
- [X] T012 Complete the Storybook review in `specs/011-issue-schedule-presentation/quickstart.md` at 375 px and desktop widths, in light and dark themes; verify keyboard reading order, labels, all date states and unchanged ordinary Labels.

## Dependencies & Execution Order

### Phase Dependencies

- Setup and Foundational require no changes because the Web workspace and existing Issue date contracts are in place.
- User Story 1 depends on no other story and can be implemented first.
- User Story 2 is independently implementable; within it, complete T006 before T008 and T005 before T007.
- Polish and validation depend on both P1 stories being complete.

### User Story Dependencies

- **US1 (P1)**: Independent; T001 precedes the component stories and surface integrations.
- **US2 (P1)**: Independent of US1; T005/T006 precede their integrations and stories.
- Both P1 stories are required for release because hiding the internal Label is part of the requested outcome.

### Parallel Opportunities

- After T001, T002 can be developed alongside surface integration T003 because the files differ.
- T005 and T006 are independent and modify separate files.
- After T006, T009 can be authored alongside T008; T007 must follow T005 and T003 to avoid editing the same files concurrently.
- Story files for US1 can be updated after the corresponding view integration is complete.

## Implementation Strategy

1. Deliver US1 first so every browsing surface uses the same date presenter.
2. Complete US2 before release to hide the internal Label and align create/edit fields.
3. Build and inspect all stories in both themes and narrow/desktop layouts, then run the signed-in smoke scenarios and required workspace checks.
