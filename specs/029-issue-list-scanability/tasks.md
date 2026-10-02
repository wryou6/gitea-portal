# Tasks: Issue list 欄位與預設排序調整

**Input**: Design documents from `specs/029-issue-list-scanability/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: No new automated tests requested. Storybook scenarios and project typecheck/build are included as acceptance validation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because files differ and dependencies are complete.
- **[Story]**: User story label for story-phase tasks.
- Each implementation task names its target file.

## Phase 1: Setup

**Purpose**: No project initialization or dependency changes are needed.

## Phase 2: Foundational

**Purpose**: Update the shared sort default required by User Story 1.

- [X] T001 Update only the default Issue view sort to `dueDate asc` in `apps/web/src/features/issues/issue-view-preference.ts`; keep current Key visibility so User Story 1 remains independently usable before the Repository label change.

**Checkpoint**: New accounts and reset actions use Due Date ascending without migrating existing preferences.

## Phase 3: User Story 1 - 優先查看近期到期項目 (Priority: P1) 🎯 MVP

**Goal**: Unconfigured Issue lists show dated Issues by earliest Due Date first while preserving URL and saved preference precedence.

**Independent Test**: Use fixtures with earlier, later, same-day, and missing Due Dates; confirm ascending order, Key-ascending ties, missing dates last, and preserved saved Key sort. Verify explicit URL override in quickstart.

- [X] T002 [US1] Add or update Storybook scenarios for default Due Date ordering, same-date Key ordering, missing dates last, and a saved Key-ascending preference in `apps/web/src/features/issues/IssueListPage.stories.tsx`.

**Checkpoint**: User Story 1 acceptance scenarios are demonstrable with the default and preference fixtures.

## Phase 4: User Story 2 - 以標題掃描 Issue (Priority: P1)

**Goal**: Key is hidden by default but remains user-selectable; Title stays visible.

**Independent Test**: Open View Options with the default preference, confirm Key is unchecked and toggleable while Title is fixed; confirm All repos identifies each row's Repository below the title; show Key, hide it again, then restore defaults.

- [X] T003 [P] [US2] Hide Key in the product default while keeping Title visible; allow saved preferences without Key but continue accepting legacy preferences with Key in `apps/web/src/features/issues/issue-view-preference.ts`.
- [X] T004 [P] [US2] Make Key visibility toggleable while keeping Title required in `apps/web/src/features/issues/IssueViewOptionsDialog.tsx`; show `owner/repo` below each All repos title and use the workspace heading and responsive row styling in `apps/web/src/features/issues/IssueListPage.tsx`, `apps/web/src/features/issues/IssueRow.tsx`, and `apps/web/src/index.css`.
- [X] T005 [US2] Add or update Storybook scenarios for default hidden Key, re-enabled Key, reset-to-default, and per-row Repository identity in `apps/web/src/features/issues/IssueListPage.stories.tsx`.

**Checkpoint**: User Story 2 acceptance scenarios are demonstrable without changing Key identity or Issue navigation.

## Phase 5: Polish & Cross-Cutting Validation

**Purpose**: Verify the feature across supported project checks and record the outcome.

- [X] T006 Run `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd --filter @gitea-portal/web build-storybook`; record results and the seven quickstart scenarios in `specs/029-issue-list-scanability/quickstart.md`.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No setup work required.
- **Foundational (Phase 2)**: T001 must complete before either user story.
- **User Stories (Phases 3–4)**: Both depend on T001; complete all of US1 before US2 so the due-date MVP retains visible Key/Repository identity. In US2, T003 and T004 can run in parallel; complete T002 before T005 because both update the Issue List Storybook file.
- **Polish (Phase 5)**: T006 follows all implementation and Storybook updates.

### User Story Dependencies

- **US1 (P1)**: Depends on T001; independent of the Key options interaction.
- **US2 (P1)**: Depends on US1 completion; hidden Key and alternate Repository identity ship together so All repos always retains per-row Repository identity.

### Parallel Opportunities

- Complete T001–T002 first; then T003 and T004 can run in parallel because they edit different files.
- T005 follows T002–T004; T006 runs after all story work is complete.

## Parallel Example: User Stories 1 and 2

```text
After T001:
Task: T002 - add Issue sorting Storybook scenarios
After User Story 1:
Task: T003 - set the default Key visibility and preference validation
Task: T004 - make Key visibility optional and retain per-row Repository identity
Then:
Task: T005 - add Key visibility/reset/Repository identity Storybook scenarios
```

## Implementation Strategy

### MVP First (User Story 1)

1. Complete T001.
2. Complete T002 and validate the Due Date ordering behavior in Storybook.
3. Complete User Story 2 for the default Key visibility change and Repository identity display.

### Incremental Delivery

1. Land the shared preference default/validation foundation.
2. Demonstrate Due Date default sorting and precedence behavior.
3. Demonstrate Key visibility controls and reset behavior.
4. Complete typecheck, production build, and Storybook build.

## Notes

- Existing Issue API already sorts missing Due Dates last and uses Key ascending as a deterministic tie-breaker; do not change API behavior.
- Existing saved preferences and Issue URL precedence remain intact.
- Keep User Story 1 independently usable with Key visible; implement hidden Key and alternate Repository identity together in User Story 2.
- Do not add Gitea writes, Issue persistence, or new UI translation strings.
