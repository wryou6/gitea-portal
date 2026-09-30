# Tasks: Kanban 欄位與卡片版面調整

**Input**: Design documents from `/specs/020-kanban-card-layout/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: No automated test runner tasks are added; Storybook stories are required as the requested visual design surface. Project typecheck, production build, and Storybook build are required validation gates.

**Organization**: Tasks are grouped by the independently reviewable user stories. All stories are P1 and share the existing Kanban surface; card tasks precede Status-menu integration where they touch the same component/stories.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project setup or dependency changes are needed; this feature uses the existing API and Web workspaces plus Storybook.

No tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No shared API, data model, or persistence foundation is required.

No tasks.

---

## Phase 3: User Story 1 - 快速掃描 Issue 卡片 (Priority: P1) 🎯 MVP

**Goal**: Arrange the card into three stable information rows: key/Type/Priority; title with a smaller inline next action; assignee/Due date. Preserve missing-value and anomaly presentation.

**Independent Test**: Inspect complete and incomplete card fixtures in Storybook and verify the prescribed order, localized missing values, hidden generic Labels, and schedule annotations.

### Implementation for User Story 1

- [X] T001 [US1] Add a due-only presentation option that reuses current date formatting, missing-value, and anomaly behavior in `apps/web/src/features/issues/ScheduleDates.tsx`.
- [X] T002 [US1] Arrange Type, Priority, next action, title, Repository/Issue key, assignee, Due date, and annotations in the specified order in `apps/web/src/features/work-views/KanbanCard.tsx`.
- [X] T003 [P] Add a locale toolbar for zh-TW, en, and ja to the Storybook provider in `apps/web/.storybook/preview.tsx`.
- [X] T004 [US1] Add full, missing-metadata, long-text, and schedule-anomaly card stories in `apps/web/src/features/work-views/KanbanCard.stories.tsx`.

**Checkpoint**: Card content follows the contract and remains readable with missing data and translated text.

---

## Phase 4: User Story 2 - 使用更寬敞的 Kanban 欄位 (Priority: P1)

**Goal**: Fill desktop board space with equal-width visible columns while preserving the existing narrow-screen lane selector.

**Independent Test**: Inspect the three-column and four-column Storybook boards at desktop/tablet widths, then inspect single-column mode at the existing mobile breakpoint.

### Implementation for User Story 2

- [X] T005 [P] [US2] Change desktop Kanban grid tracks to equally fill available width for all visible columns and preserve the mobile override in `apps/web/src/index.css`.
- [X] T006 [US2] Add three-Status-column and four-column-with-Anomaly Storybook fixtures in `apps/web/src/features/work-views/KanbanBoard.stories.tsx`.

**Checkpoint**: Three or four desktop columns are equally sized; narrow-screen single-column behavior remains usable.

---

## Phase 5: User Story 3 - 移動 Issue Status (Priority: P1)

**Goal**: Keep Status controls off cards. Regular cards can still be dragged through the existing transition dialog; keyboard users can open Issue detail from the card title and use its Status action. Anomaly cards have no drag affordance.

**Independent Test**: In Storybook, confirm cards have no Status button, regular cards remain draggable, Anomaly cards are not draggable, and card titles remain keyboard-focusable links. No Gitea write is needed for Storybook review.

### Implementation for User Story 3

- [X] T007 [US3] Replace the card's `Move to Status` select with a localized, focus-visible disclosure trigger and destination buttons that call the existing `onMove` callback in `apps/web/src/features/work-views/KanbanCard.tsx`.
- [X] T008 [US3] Prevent Anomaly cards from receiving Status destinations while preserving existing drag/drop restrictions in `apps/web/src/features/work-views/KanbanColumn.tsx`.
- [X] T009 [US3] Add Storybook coverage for keyboard-operable Status choices and Anomaly cards without transition controls in `apps/web/src/features/work-views/KanbanCard.stories.tsx` and `apps/web/src/features/work-views/KanbanBoard.stories.tsx`.

**Checkpoint**: Regular Status cards retain drag and dialog-based transitions; Anomaly cards remain non-transitionable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate all stories together and preserve the project's UI quality gates.

- [X] T010 Run `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd --filter @gitea-portal/web build-storybook`; record results in `specs/020-kanban-card-layout/quickstart.md`.
- [X] T011 Inspect Kanban card/board stories in Storybook across zh-TW, en, ja, light/dark, desktop, tablet, narrow viewport, keyboard focus, and Status affordances; record any acceptance gaps in `specs/020-kanban-card-layout/quickstart.md`.
- [ ] T012 Validate the Issue detail keyboard action and Kanban drag transition separately with disposable local Issues; confirm both open the existing Status transition dialog and defer Gitea writes until confirmation using `specs/020-kanban-card-layout/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No work; workspace and Storybook already exist.
- **Foundational (Phase 2)**: No work; no shared API or data-model prerequisite.
- **User Story 1 (Phase 3)**: First; establishes the card row order and due-only rendering.
- **User Story 2 (Phase 4)**: Independent of card internals; can run after Phase 2, in parallel with US1 if separate files are assigned.
- **User Story 3 (Phase 5)**: Depends on US1 because it edits the same KanbanCard component and stories; retains the dialog path.
- **Polish (Phase 6)**: Depends on all three stories.

### User Story Dependencies

- **US1**: No dependencies on other stories.
- **US2**: No dependencies on other stories; only shares the KanbanBoard story file with US3, so those story edits must be sequential.
- **US3**: Depends on the US1 card layout before replacing its control and adding menu interaction coverage.

### Parallel Opportunities

- T003 can run alongside T001/T002 because it only changes Storybook preview configuration.
- T005 can run alongside US1 card work; it changes only global CSS.
- US2 board stories (T006) can be authored alongside US1 card stories (T004), but US3 edits to `KanbanBoard.stories.tsx` wait for T006.
- Tasks touching `KanbanCard.tsx`, `KanbanCard.stories.tsx`, or `KanbanBoard.stories.tsx` must run in listed dependency order.

## Implementation Strategy

### MVP First

1. Complete US1 (T001-T004) and inspect the card information order and missing-value states in Storybook.
2. Add US2 equal-width columns and US3 drag-transition/anomaly boundaries without card Status controls.
3. Complete both project builds and the full Storybook review in T010-T011.

### Incremental Delivery

1. Deliver the three-row card layout with its own stories.
2. Deliver desktop column sizing and three-/four-column board stories.
3. Keep Status actions out of cards while preserving drag transitions and the keyboard path through Issue detail.
4. Run the cross-cutting validation gate.

## Notes

- Task IDs are sequential, every implementation/validation task names its file path, and story tasks map to the corresponding spec story.
- No API or Gitea write code is in scope; the existing Status transition dialog remains the sole confirmation/write entry point.
- Storybook data must stay fictional and must not fetch live Issue data.

## Phase 7: Convergence

**Purpose**: Close a remaining Anomaly transition path found during code review.

- [X] T013 [US3] Prevent Anomaly-column cards from being dragged as a source into a Status column, and add Storybook coverage that confirms they have no drag or menu transition affordance in `apps/web/src/features/work-views/KanbanCard.tsx`, `apps/web/src/features/work-views/KanbanColumn.tsx`, and `apps/web/src/features/work-views/KanbanBoard.stories.tsx`.
- [X] T014 [US3] Exclude Anomaly from regular cards' Status destinations and verify the Storybook disclosure offers only Todo, In Progress, and Done in `apps/web/src/features/work-views/KanbanColumn.tsx`.
- [X] T015 [US1][US3] Remove the card Status disclosure, organize Issue key/Type/Priority, title/next action, and assignee/due date into three main rows, truncate long titles with an ellipsis, update zh-TW 看板 terminology, and revise the feature contract and Storybook fixtures in `apps/web/src/features/work-views/KanbanCard.tsx`, `apps/web/src/features/work-views/KanbanColumn.tsx`, `apps/web/src/features/work-views/KanbanCard.stories.tsx`, `apps/web/src/index.css`, `apps/web/src/i18n/resources/common.ts`, and `apps/web/src/i18n/resources/work-views.ts`.
- [X] T016 [US1] Show the first retained Gitea Assignee as 「最後負責人」 on Done cards, keep 「目前負責人」 on open cards, add the empty-roster presentation and three-locale Storybook coverage, and update the card contract in `apps/web/src/features/work-views/KanbanCard.tsx`, `apps/web/src/features/work-views/KanbanCard.stories.tsx`, `apps/web/src/i18n/resources/work-views.ts`, and `specs/020-kanban-card-layout/`.
- [X] T017 [US1] Hide generic Gitea Label chips that are not used by Kanban Card fields while preserving the complete Label set in Issue list/detail, and update the card contract in `apps/web/src/features/work-views/KanbanCard.tsx` and `specs/020-kanban-card-layout/`.
- [X] T018 [US1] Separate the assignee and Due date groups in the third card row with consistent spacing and a subtle divider; verify desktop and narrow widths in Storybook in `apps/web/src/features/work-views/KanbanCard.tsx` and `apps/web/src/index.css`.
- [X] T019 [US1] Align Type and Priority badges to the left of the first row and the Repository/Issue key to the right; review wrapping of long keys in Storybook in `apps/web/src/features/work-views/KanbanCard.tsx` and `apps/web/src/index.css`.
- [X] T020 [US1] Order the left-side badges Priority then Type, preserve the right-aligned key, and verify the final first row in Storybook in `apps/web/src/features/work-views/KanbanCard.tsx` and `specs/020-kanban-card-layout/`.
- [X] T021 [US1] Sort Todo/In Progress/Anomaly cards by Priority, valid Due date, and oldest update; sort Done by most recent update, with stable Repository/Issue tie-breakers in `apps/api/src/work-views/kanban-service.ts` and `specs/020-kanban-card-layout/`.
