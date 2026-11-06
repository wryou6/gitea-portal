---
description: "Task list for feature implementation"
---

# Tasks: Issue Type 呈現統一

**Input**: Design documents from `specs/009-issue-type-presentation/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: No new automated test suite requested. Storybook stories are required design and visual review artifacts; final checks are listed in Polish.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel because tasks touch separate files and have no dependency on one another.
- **[Story]**: User story served by the task.
- Each implementation task lists exact repository paths.

## Phase 1: Setup

**Purpose**: Reuse the existing pnpm workspace, theme tokens, and Storybook configuration; no project initialization or dependency installation is required.

## Phase 2: Foundational

**Purpose**: Add the shared Type visual language before integrating individual surfaces.

- [x] T001 Define light/dark semantic Type color tokens and implement the shared valid/missing/conflict badge with direct names and non-color cues in `apps/web/src/index.css`, `apps/web/src/components/ui/IssueTypeBadge.tsx`, and `apps/web/src/components/ui/IssueTypeBadge.stories.tsx`.

**Checkpoint**: The shared badge renders Bug, Feature, Task, 未設定, and 衝突 consistently in Storybook's light/dark themes.

---

## Phase 3: User Story 1 - 跨頁辨識 Issue Type (Priority: P1) 🎯 MVP

**Goal**: Show the same direct Type names and visual semantics in Issue list/detail, Kanban, Gantt, and Type selection fields.

**Independent Test**: Inspect each surface's Storybook example; valid types use the shared presentation, appear in the title/field hierarchy specified by the spec, and do not repeat `type:*` in visible labels.

### Implementation for User Story 1

- [x] T002 [P] [US1] Place the shared Type badge beside the title and before secondary metadata in `apps/web/src/features/issues/IssueRow.tsx` and `apps/web/src/features/issues/IssueDetailHeader.tsx`; update `apps/web/src/features/issues/LabelList.tsx` so the badge represents the valid Type Label once and all other labels remain visible; add/update `apps/web/src/features/issues/IssueRow.stories.tsx` and `apps/web/src/features/issues/IssueDetailHeader.stories.tsx`.
- [x] T003 [P] [US1] Add the shared Type badge below the card title and before repository/assignee metadata in `apps/web/src/features/boards/KanbanCard.tsx`; suppress only the duplicate Type label in the rendered collection without changing `visibleLabels`; update `apps/web/src/features/boards/KanbanCard.stories.tsx`.
- [x] T004 [P] [US1] Extract a standalone Gantt issue row and place the shared Type badge in its title block for scheduled, unscheduled, and date-anomalous rows in `apps/web/src/features/boards/GanttBoard.tsx` and `apps/web/src/features/boards/GanttIssueRow.tsx`; add `apps/web/src/features/boards/GanttIssueRow.stories.tsx` for each schedule variant.
- [x] T005 [P] [US1] Create a reusable native Type selector with canonical option names and selected-value Type styling, then use it in `apps/web/src/features/issues/IssueCreatePage.tsx` and `apps/web/src/features/issues/IssueEditForm.tsx`; add `apps/web/src/features/issues/IssueTypeField.stories.tsx`.

**Checkpoint**: Valid Type values are visible in all named Issue surfaces and both forms; API payloads, Gitea labels, and form selection behavior remain unchanged.

---

## Phase 4: User Story 2 - 辨識未設定或衝突的 Type (Priority: P1)

**Goal**: Display missing or conflicting Type states consistently without guessing a valid type or losing the distinguishable conflict values.

**Independent Test**: Inspect missing, multiple, and invalid Type stories across each read surface and the edit field; all show an anomaly cue, and no anomalous Issue appears as Bug, Feature, or Task.

### Implementation for User Story 2

- [x] T006 [P] [US2] Pass missing/conflict state and conflict values into the shared badge in `apps/web/src/features/issues/IssueRow.tsx` and `apps/web/src/features/issues/IssueDetailHeader.tsx`, retain edit-form repair guidance in `apps/web/src/features/issues/IssueEditForm.tsx`, and add missing/conflicting cases to `apps/web/src/features/issues/IssueRow.stories.tsx`, `apps/web/src/features/issues/IssueDetailHeader.stories.tsx`, and `apps/web/src/features/issues/IssueTypeField.stories.tsx`.
- [x] T007 [P] [US2] Show missing/conflict states and conflict values in Kanban and every Gantt row variant, including the date-anomaly path in `apps/web/src/features/boards/GanttBoard.tsx`, `apps/web/src/features/boards/GanttIssueRow.tsx`, `apps/web/src/features/boards/KanbanCard.tsx`, `apps/web/src/features/boards/KanbanCard.stories.tsx`, and `apps/web/src/features/boards/GanttIssueRow.stories.tsx`; preserve workflow repair and date-anomaly annotations.

**Checkpoint**: All surfaces distinguish valid, missing, and conflicting Type states; repair, workflow, schedule, and labels behavior remains intact.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validate responsive layout, theme contrast, Storybook completeness, and workspace build health.

- [x] T008 Review every Type story at 375px and 1280px in light and dark themes; adjust semantic palette and no-wrap/wrapping rules in `apps/web/src/index.css` until text contrast is at least 4.5:1 and no Type content is clipped.
- [x] T009 Run the scenarios in `specs/009-issue-type-presentation/quickstart.md` and execute `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd --filter @gitea-portal/web build-storybook` from the repository root; fix failures in the referenced source/story files.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Existing workspace; no tasks.
- **Foundational (Phase 2)**: T001 establishes the shared component/tokens and blocks all surfaces.
- **User Stories**: US1 tasks T002-T005 depend on T001 and touch separate component areas, so they can run in parallel. US2 tasks T006-T007 depend on the corresponding US1 integrations and can run in parallel with each other.
- **Polish**: T008-T009 depend on both stories being complete; T009 follows any visual corrections from T008.

### User Story Dependencies

- **US1 (P1)**: Starts after T001; no dependency among T002-T005.
- **US2 (P1)**: Requires the shared badge and each applicable US1 integration; T006 and T007 are independent of each other.

### Parallel Opportunities

- After T001, T002, T003, T004, and T005 can be assigned independently.
- After US1 integration, T006 and T007 can be assigned independently.
- T008 and T009 should remain sequential because visual corrections may affect the final builds.

## Parallel Example: User Story 1

```text
Task: T002 Issue list/detail Type placement and labels
Task: T003 Kanban Type placement and duplicate suppression
Task: T004 Gantt row extraction and Type placement
Task: T005 Create/edit Type selector styling
```

## Implementation Strategy

### MVP First (User Story 1)

1. Complete T001 shared badge and tokens.
2. Complete T002-T005 to expose valid Type across every required surface.
3. Review US1 Storybook scenarios before adding anomaly states.

### Incremental Delivery

1. Deliver valid Type presentation across all surfaces as US1.
2. Add missing/conflict states as US2 while preserving repair and workflow behavior.
3. Finish responsive/theme review and all three requested build checks.

## Notes

- No API, contract, domain, or persistence task is needed.
- [P] tasks touch separate files and have no dependency on incomplete tasks.
- Storybook stories are the requested design artifacts; no separate test suite is added.

## Phase 6: Convergence

- [x] T010 Open the Type stories in a browser at 375px and 1280px in light and dark themes, verify readability and clipping, and record any required CSS adjustments per SC-004 (partial). Fixed the Storybook theme wrapper to apply semantic foreground/background colors; Playwright reviewed 33 stories × 2 widths × 2 themes (132 combinations) with zero overflow, clipping, or contrast violations and 7.08:1 minimum contrast.
