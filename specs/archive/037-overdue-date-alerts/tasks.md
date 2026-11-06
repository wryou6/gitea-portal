---
description: "Task list for cross-view overdue due-date indicators"
---

# Tasks: 跨檢視逾期日期提示

**Input**: Design documents from `specs/037-overdue-date-alerts/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: No dedicated automated test runner is added. Storybook examples provide deterministic visual cases; workspace typecheck/build and quickstart scenarios provide validation.

**Organization**: Tasks are grouped by user story. Shared predicate and indicator are foundational prerequisites.

## Phase 1: Setup

**Purpose**: No project setup is required; the current workspace, i18n resources, and Storybook environment already exist.

---

## Phase 2: Foundational

**Purpose**: Define the shared overdue rule and accessible indicator used by all views.

- [x] T001 [P] Add a pure overdue-date predicate accepting Issue state, due date, schedule anomaly, and an optional deterministic local-today value in `apps/web/src/features/issues/overdue-date.ts`; require Open state, a valid calendar date strictly before today, and suppress invalid due dates or reversed ranges.
- [x] T002 [P] Extract a recognizable fire silhouette into a reusable icon-only red marker in `apps/web/src/features/issues/OverdueIndicator.tsx`, reusing `issues.overdue` as its accessible name.

**Checkpoint**: Shared rules and visual presentation are available without API or persistence changes.

---

## Phase 3: User Story 1 - 跨檢視辨識逾期 Issue (Priority: P1) 🎯 MVP

**Goal**: Show one consistent overdue cue in Issue List, Kanban, Gantt, and Issue detail.

**Independent Test**: In each view, confirm an Open Issue with a valid past due date has the fire indicator and accessible label; today/future due dates and Closed Issues do not. Confirm Gantt marks the title without tinting the full row.

### Implementation for User Story 1

- [x] T003 [US1] Use the shared predicate and indicator for Issue List and date displays in `apps/web/src/features/issues/IssueRow.tsx`, `apps/web/src/features/issues/ScheduleDates.tsx`, `apps/web/src/features/issues/IssueDetailHeader.tsx`, and `apps/web/src/features/work-views/KanbanCard.tsx`, preserving current date formatting and layout.
- [x] T004 [P] [US1] Add the compact overdue fire icon beside the title in `apps/web/src/features/work-views/GanttIssueRow.tsx`, calculate against its supplied local `today` value, and style without recoloring the row in `apps/web/src/index.css`.
- [x] T005 [US1] Add deterministic normal overdue, due-today, future-due, and closed-Issue examples to `apps/web/src/features/issues/IssueRow.stories.tsx`, `apps/web/src/features/issues/ScheduleDates.stories.tsx`, `apps/web/src/features/issues/IssueDetailHeader.stories.tsx`, `apps/web/src/features/work-views/KanbanCard.stories.tsx`, and `apps/web/src/features/work-views/GanttIssueRow.stories.tsx`.

**Checkpoint**: All four views present the same overdue meaning and keep existing sort/filter behavior.

---

## Phase 4: User Story 2 - 區分逾期與日期異常 (Priority: P2)

**Goal**: Avoid false overdue cues for invalid due dates while retaining a valid overdue cue alongside independent start-date anomalies.

**Independent Test**: Confirm invalid due date and reversed-range examples show anomalies without overdue; confirm a start-date anomaly with a valid past due date shows both cues.

### Implementation for User Story 2

- [x] T006 [US2] Add invalid due date, reversed-range, and start-date-only anomaly examples to `apps/web/src/features/issues/ScheduleDates.stories.tsx`, `apps/web/src/features/issues/IssueRow.stories.tsx`, `apps/web/src/features/issues/IssueDetailHeader.stories.tsx`, `apps/web/src/features/work-views/KanbanCard.stories.tsx`, and `apps/web/src/features/work-views/GanttIssueRow.stories.tsx`; ensure the existing anomaly message remains visible with the correct overdue result.

**Checkpoint**: Date anomalies and overdue status can be distinguished in every applicable view.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validate workspace compatibility, localization, responsive presentation, and end-to-end behavior.

- [x] T007 Verify all supported `issues.overdue` translations and narrow-screen/readable indicator styling in `apps/web/src/i18n/resources/issues.ts` and `apps/web/src/index.css`; run `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd --filter @gitea-portal/web build-storybook`.
- [ ] T008 Execute the view, boundary-date, closed-Issue, anomaly, keyboard/screen-reader, and no-data-mutation scenarios in `specs/037-overdue-date-alerts/quickstart.md` and record results there.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No tasks; existing workspace is ready.
- **Foundational (Phase 2)**: T001 and T002 are independent and block all UI integration.
- **User Story 1 (Phase 3)**: T003 and T004 can proceed in parallel after Phase 2; T005 follows both because its stories exercise the completed UI.
- **User Story 2 (Phase 4)**: T006 follows the shared UI integration and normal visual examples.
- **Polish (Phase 5)**: T007 and T008 follow all implementation work; validation is sequential to preserve clear results.

### User Story Dependencies

- **User Story 1 (P1)**: Depends only on the shared predicate and indicator; it is the MVP.
- **User Story 2 (P2)**: Uses the same predicate and view components as US1 to validate anomaly interactions; no dependency on changes to Issue data or API.

### Parallel Opportunities

- T001 and T002 touch separate new files and can run in parallel.
- T003 and T004 touch separate view components and can run in parallel after Phase 2.

## Implementation Strategy

### MVP First

1. Complete T001-T002 shared presentation foundation.
2. Complete T003-T005 for User Story 1 and validate all four views.
3. Complete T006 for anomaly combinations.
4. Complete T007-T008 for project and manual validation.

### Incremental Delivery

Deliver the consistent overdue cue first, then verify anomaly interactions, then complete cross-locale, responsive, and end-to-end validation. No step writes Issue data to Gitea.

## Phase 6: Convergence

- [ ] T009 Perform browser runtime visual, keyboard, and screen-reader acceptance for all four views and record the observed results in `specs/037-overdue-date-alerts/quickstart.md` per US1/AC5 and SC-003 (partial).
