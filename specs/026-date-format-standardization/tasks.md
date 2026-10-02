---
description: "Task list for standardizing Portal date display"
---

# Tasks: 日期格式統一

**Input**: Design documents from `specs/026-date-format-standardization/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: No automated test tasks; the spec does not request a new test framework or TDD workflow. Run the project typecheck/build and the manual quickstart scenarios.

## Phase 1: Setup

No new dependency or project setup is required.

## Phase 2: Foundational

**Purpose**: Define deterministic shared formatting before updating its Web views.

- [X] T001 Implement fixed numeric date-only and local 24-hour timestamp formatters in `apps/web/src/i18n/format.ts`, preserving UTC calendar dates, Gregorian year, Latin digits, and zero-padded fields.

## Phase 3: User Story 1 - 快速辨識日期與時間 (Priority: P1)

**Goal**: Show full dates and timestamps in the agreed format across Portal views while preserving compact Gantt ticks and native date controls.

**Independent Test**: Follow `specs/026-date-format-standardization/quickstart.md` and confirm all displayed full dates match the requirements across zh-TW, en, and ja.

### Implementation

- [X] T002 [US1] Update shared formatter call sites to use locale-independent date output in `apps/web/src/features/issues/IssueComments.tsx`, `apps/web/src/features/issues/IssueDetailHeader.tsx`, `apps/web/src/features/issues/IssueRow.tsx`, `apps/web/src/features/issues/ScheduleDates.tsx`, `apps/web/src/features/work-views/GanttIssueRow.tsx`, and `apps/web/src/features/work-views/GanttBoard.stories.tsx`.
- [X] T003 [P] [US1] Format complete Gantt date tooltips, range-slider values, and accessible names with the shared calendar-date formatter while retaining existing month labels and compact cell ticks in `apps/web/src/features/work-views/GanttCalendarHeader.tsx` and `apps/web/src/features/work-views/GanttBoard.tsx`.

### Validation

- [X] T004 [US1] Run `pnpm.cmd typecheck` and `pnpm.cmd build`.
- [ ] T005 [US1] Complete the manual scenarios in `specs/026-date-format-standardization/quickstart.md`.

## Dependencies

- T001 precedes T002 and T003 because view call sites depend on the finalized shared formatters.
- T002 and T003 can proceed in parallel after T001 because they update separate files.
- T004 and T005 follow all implementation tasks.

## Parallel Execution Example

After T001 completes, the Issue/Comment call-site changes (T002) and Gantt full-date accessibility/title changes (T003) can be implemented in parallel.

## Implementation Strategy

1. Complete T001 to establish the shared formatting behavior.
2. Complete T002 and T003 for Issue, Comment, schedule, and Gantt full-date displays.
3. Complete T004 to validate type safety and production build, then complete T005 for the specified browser scenarios.
