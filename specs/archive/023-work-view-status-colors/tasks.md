---
description: "Task list for work-view colors and selectable product palettes"
---

# Tasks: 工作檢視色彩與可切換配色

**Input**: Design documents from `specs/023-work-view-status-colors/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: No automated test suite was requested. Storybook visual scenarios and package validation are required.

**Organization**: Tasks are grouped by user story and run sequentially where they touch the shared stylesheet.

## Phase 1: Foundational

**Purpose**: Formalize the existing stable Status palette for reuse by badges, Gantt rows and schedule bars.

- [x] T001 Define light/dark semantic badge palette tokens and map Status, Type and Priority families to shared color roles in `apps/web/src/index.css`.

**Checkpoint**: Existing Status badges retain their semantic mapping in both themes.

## Phase 2: User Story 1 - 快速追蹤 Issue List 的列 (Priority: P1)

**Goal**: Add subtle alternating backgrounds to Issue data rows while preserving hover and empty states.

**Independent Test**: Review the default and alternating-row List stories at desktop and narrow widths, with light and dark themes.

- [x] T002 [US1] Add theme-aware alternating backgrounds to `.issue-table-row` while preserving hover precedence and excluding the empty row in `apps/web/src/index.css`.
- [x] T003 [US1] Add a multi-row `AlternatingRows` fixture story with mixed Status values in `apps/web/src/features/issues/IssueListPage.stories.tsx`.

**Checkpoint**: Neighboring Issue rows visibly alternate; hover remains clear and an empty list remains unstriped.

## Phase 3: User Story 2 - 跨檢視辨認固定 Status 色彩 (Priority: P1)

**Goal**: Apply each Issue's Status color to the Gantt row tint and schedule bar for every row group.

**Independent Test**: Review Gantt rows for Todo, In Progress, Done and anomaly Status across scheduled, unscheduled and date-anomaly groups, in light/dark themes and narrow/desktop viewports.

- [x] T004 [US2] Expose the existing Issue Status on each Gantt row with a `data-status` attribute in `apps/web/src/features/work-views/GanttIssueRow.tsx`.
- [x] T005 [US2] Style Gantt row surfaces and schedule bars from the shared Status tokens, retaining anomaly emphasis and hover contrast in `apps/web/src/index.css`.
- [x] T006 [US2] Add explicit mixed-Status and anomaly Gantt stories covering scheduled, unscheduled and date-anomaly rows in `apps/web/src/features/work-views/GanttBoard.stories.tsx`.

**Checkpoint**: Badges, row surfaces and schedule bars share one stable Status mapping; status text and anomaly annotation remain visible.

## Phase 4: Polish & Validation

**Purpose**: Verify design consistency and preserve existing interactions and data behavior.

- [x] T007 Review the List, Gantt and cross-family Badge Palette stories in zh-TW/en/ja, light/dark themes, desktop/narrow widths; run `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd --filter @gitea-portal/web build-storybook`; fix any presentation or validation regressions in the owning files.

## Phase 5: Convergence - 跨類型 Badge 一致性

**Purpose**: Align Status badge implementation with Type, Priority and neutral Label badges across all Issue surfaces.

- [x] T008 Create `IssueStatusBadge` with the shared `Badge` primitive and use it in `apps/web/src/features/issues/IssueRow.tsx`, `apps/web/src/features/issues/IssueDetailHeader.tsx`, and `apps/web/src/features/work-views/GanttIssueRow.tsx`.
- [x] T009 Add a Storybook palette for Status, Type, Priority, missing/conflict and neutral Label badges in `apps/web/src/components/ui/IssueBadgePalette.stories.tsx`.

## Phase 6: User Story 3 - 可切換產品配色

**Goal**: Make all three desktop palette proposals selectable in Settings and persist each account's choice independently of light/dark/system mode.

**Independent Test**: Switch palettes from Settings, review List/Kanban/Gantt and badge colors in light/dark/system modes, reload, and verify another account retains its own preference.

- [x] T010 [US3] Define Cobalt, Juniper and Iris light/dark semantic color tokens for global surfaces, primary controls and all badge roles in `apps/web/src/index.css`.
- [x] T011 [US3] Add account-scoped palette read/save/apply functions with Cobalt fallback in `apps/web/src/features/settings/theme-preference.ts`; load during app bootstrap and apply changes immediately in `apps/web/src/app/App.tsx`.
- [x] T012 [US3] Add accessible palette radio cards and translated labels/descriptions/swatches to Settings and a selectable Settings Storybook screen in zh-TW/en/ja.
- [x] T013 [US3] Validate all six palette/theme combinations across Issue List, Kanban, Gantt, shared badges and Settings; confirm preference survives reload and uses the existing per-account storage pattern.
- [x] T014 Update the feature spec, plan, research, quickstart and task checklist with selectable palettes and final verification results.

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational**: T001 defines shared Status tokens before either view consumes them.
- **US1**: T002 uses the shared surface tokens; T003 demonstrates the result.
- **US2**: T004 exposes the existing Status; T005 styles it; T006 documents the complete visual states.
- **Polish**: T007 depends on both user stories.

### Parallel Opportunities

- No tasks share a safe parallel boundary for the single shared stylesheet. Execute the tasks in listed order.

## Implementation Strategy

1. Define stable theme-aware Status tokens.
2. Deliver and review Issue List striping.
3. Deliver and review Gantt row/bar Status colors.
4. Complete Storybook and package validation before commit.
5. Add Settings selection for all palettes, validate account-scoped persistence, and record results before commit.
