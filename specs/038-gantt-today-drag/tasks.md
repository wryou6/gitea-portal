# Tasks: Gantt 今天高亮與拖曳排程

**Input**: Design documents from `/specs/038-gantt-today-drag/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/gantt-schedule-drag.md, quickstart.md

**Tests**: No separate automated test suite was requested. Storybook scenarios are included for visual and interaction review; required static/build validation is in Polish.

**Organization**: Tasks are grouped by user story for traceability. US2 depends on US1 because both update the Gantt row styling.

## Phase 1: Setup

**Purpose**: Existing pnpm workspace and Gantt modules are already initialized; no dependency or project setup changes are required.

## Phase 2: Foundational

**Purpose**: No shared API or persisted data model changes are required. Pointer and refresh integration are implemented with US2.

---

## Phase 3: User Story 1 - 快速辨識今天 (Priority: P1) 🎯 MVP

**Goal**: Replace the thin today marker with a full-day tint and highlighted date header across every timeline scale.

**Independent Test**: Storybook covers today inside/outside the timeline, four scales, weekend overlap, bars crossing today, and both themes.

### Implementation for User Story 1

- [x] T001 [US1] Render a one-calendar-day today overlay in the date header and every Gantt row using the existing timeline position helpers in `apps/web/src/features/work-views/GanttCalendarHeader.tsx` and `apps/web/src/features/work-views/GanttIssueRow.tsx`.
- [x] T002 [US1] Style the today band and emphasized today header label with theme-aware tokens, keeping weekend below today and schedule bars above it in `apps/web/src/index.css`.
- [x] T003 [US1] Add Storybook coverage for Day, Week, 2 weeks, Month, today outside range, weekend overlap, and bars crossing today in `apps/web/src/features/work-views/GanttIssueRow.stories.tsx` and `apps/web/src/features/work-views/GanttBoard.stories.tsx`.

**Checkpoint**: Today is visible as one highlighted calendar day across all scales without hiding bars.

---

## Phase 4: User Story 2 - 直接拖曳調整排程 (Priority: P1)

**Goal**: Resize or move scheduled bars, create unscheduled ranges, and save dates through the existing Gitea Issue update flow.

**Independent Test**: Storybook validates preview, endpoint mapping, range movement/creation, keyboard operation, cancellation, edge extension, and error states; authenticated Gitea scenarios are in `quickstart.md`.

### Implementation for User Story 2

- [x] T004 [P] [US2] Add localized drag handle names, keyboard instructions, saved announcements, and schedule-save error text in zh-TW, en, and ja in `apps/web/src/i18n/resources/work-views.ts`.
- [x] T005 [P] [US2] Add calendar-day drag coordinate, range clamp/move, and date-axis extension helpers in `apps/web/src/features/work-views/gantt-timeline.ts`.
- [x] T006 [US2] Implement scheduled bar endpoint resizing, range movement, single-date endpoint mapping, unscheduled range creation, keyboard preview/save/cancel, and anomaly-row non-interactivity in `apps/web/src/features/work-views/GanttIssueRow.tsx`.
- [x] T007 [US2] Add drag preview lifecycle, edge auto-scroll/extension, and pointer-to-date mapping across current scale cells in `apps/web/src/features/work-views/GanttBoard.tsx`.
- [x] T008 [US2] Allow date-only Issue PATCH payloads and preserve omitted Type, Priority, Status, and general Labels during schedule updates in `apps/api/src/issues/issue-validation.ts`, `apps/api/src/issues/issue-command-service.ts`, and `apps/api/src/issues/issue-schedule-service.ts`.
- [x] T009 [US2] Pass a schedule-save callback from the Gantt parent, PATCH only changed date fields with `expectedUpdatedAt`, and reload actual Gitea schedule after success or failure in `apps/web/src/features/work-views/KanbanBoard.tsx` and `apps/web/src/features/work-views/GanttBoard.tsx`.
- [x] T010 [US2] Add visible endpoint hit targets, drag preview, focus, and live announcement styling without obscuring schedule bars in `apps/web/src/index.css`.
- [x] T011 [US2] Add Storybook mock-save scenarios for endpoint mapping, moving ranges, single-date rows, unscheduled creation, cancellation, date clamping, edge extension, keyboard operation, and save errors in `apps/web/src/features/work-views/GanttIssueRow.stories.tsx` and `apps/web/src/features/work-views/GanttBoard.stories.tsx`.

**Checkpoint**: Pointer/keyboard edits save through Gitea and the refreshed Issue value replaces every preview.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verify the complete interaction and retain project governance constraints.

- [x] T012 Review drag labels and announcements in all supported locales and light/dark Storybook globals at narrow and desktop widths in `apps/web/src/i18n/resources/work-views.ts` and `apps/web/src/features/work-views/GanttBoard.stories.tsx`.
- [x] T013 Run `pnpm.cmd typecheck`, `pnpm.cmd build`, `pnpm.cmd --filter @gitea-portal/web build-storybook`, and the configured Gitea scenarios from `specs/038-gantt-today-drag/quickstart.md` against any fake Issue, restoring its original schedule and Labels afterward; resolve failures without changing delegated permissions or atomic Label replacement.

## Dependencies & Execution Order

### Phase Dependencies

- Setup and Foundational require no work because the current workspace, date model, and Issue update route already exist.
- US1 (Phase 3) can start immediately and must finish before US2 changes shared row styling.
- US2 (Phase 4) depends on the today overlay structure from US1; T004 and T005 can run in parallel, then T006–T011 follow their interface dependencies.
- Polish (Phase 5) depends on both user stories.

### User Story Dependencies

- **US1 (P1)**: Independent; no dependencies on US2.
- **US2 (P1)**: Starts after US1 because both modify `GanttIssueRow.tsx` and `index.css`; schedule write callback remains isolated to Gantt routes.

### Parallel Opportunities

- T004 (translations) and T005 (date math) edit separate files and can run in parallel.
- Within US1, the header/row overlay implementation and CSS use separate files and can be developed in parallel before Storybook coverage is integrated.

## Parallel Example: User Story 2

```text
Task: T004 Add localized drag strings in apps/web/src/i18n/resources/work-views.ts
Task: T005 Add calendar-day drag helpers in apps/web/src/features/work-views/gantt-timeline.ts
```

## Implementation Strategy

1. Deliver US1 first as the MVP: highlight today across header and rows.
2. Deliver US2 on the same Gantt surface: pointer/keyboard previews, date save callback, refresh/error behavior.
3. Complete locale/theme/responsive Storybook review and run the project-required validation.
