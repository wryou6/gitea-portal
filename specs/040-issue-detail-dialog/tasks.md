---
description: "Task list for the Issue detail dialog feature"
---

# Tasks: 三個工作檢視的 Issue 浮窗

**Input**: Design documents from `specs/040-issue-detail-dialog/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/issue-detail-navigation.md`

**Organization**: Tasks are grouped by user story so each primary journey can be implemented and checked independently.

## Phase 1: Setup

**Purpose**: Project initialization and dependencies

React Router 8.4 and the existing Web workspace are already configured; no project setup or new dependency is required.

---

## Phase 2: Foundational

**Purpose**: Shared navigation parsing needed by both user stories

- [X] T001 Add a typed helper for parsing and validating the masked Issue path and its safe `returnTo` in `apps/web/src/app/routes.ts`.

**Checkpoint**: Masked Issue identity and return target can be resolved without changing existing route paths or work-view query sanitization.

---

## Phase 3: User Story 1 - 從工作檢視快速查看 Issue (Priority: P1) 🎯 MVP

**Goal**: Open complete Issue details in a floating dialog from existing Issue key/title links while keeping the source view mounted.

**Independent Test**: Open an Issue from Issue List, Kanban, and Gantt; verify the Issue URL, full details, close/back behavior, source view state, keyboard focus, and unchanged drag/schedule interactions.

### Implementation for User Story 1

- [X] T002 [US1] Add `Link.mask` navigation from the existing key/title links in `apps/web/src/features/issues/IssueRow.tsx`, `apps/web/src/features/work-views/KanbanCard.tsx`, `apps/web/src/features/work-views/GanttIssueRow.tsx`, and pass the sanitized current return target from `apps/web/src/features/work-views/GanttBoard.tsx`; explicitly push the source view history entry and do not make rows, cards, or timeline regions clickable.
- [X] T003 [US1] Render the existing source view plus an Issue detail dialog for in-session masked navigation in `apps/web/src/app/App.tsx`; configure `apps/web/src/main.tsx` with Data Router APIs so `Link.mask` works at runtime, using the route helper from T001 and leaving ordinary routes unchanged.
- [X] T004 [US1] Add a dialog presentation to `apps/web/src/features/issues/IssueDetailPage.tsx` that reuses existing Issue/Comments loading, error, edit, comment, and Status behavior while accepting the masked URL's validated return target.
- [X] T005 [US1] Extend `apps/web/src/components/ui/Dialog.tsx` to support a right-side header action, focus return, and topmost-only Escape/focus trapping for nested Status transition dialogs without breaking existing dialogs.
- [X] T006 [P] [US1] Add localized expand action text and accessible labels for zh-TW, en, and ja in `apps/web/src/i18n/resources/issues.ts`.
- [X] T007 [US1] Replace address-bar-dependent work-view URL reads with Router location reads in `apps/web/src/features/issues/IssueListPage.tsx` and `apps/web/src/features/work-views/KanbanBoard.tsx`, so filter/sort and return targets use the unmasked work-view location.
- [X] T008 [P] [US1] Add responsive large-dialog styles in `apps/web/src/index.css`, including a vertically scrollable body and visible header controls on narrow screens.
- [X] T009 [US1] Add or update Storybook coverage for loading, loaded, error, modal actions, nested Status transition dialog, and keyboard focus states in `apps/web/src/features/issues/IssueDetailPage.stories.tsx` and affected Issue/work-view stories.

**Checkpoint**: Each of the three work views opens complete Issue details; closing by control, Escape, backdrop, or browser Back returns to the source view without intercepting Kanban/Gantt gestures.

---

## Phase 4: User Story 2 - 直接進入 Issue 完整頁面 (Priority: P2)

**Goal**: Keep direct Issue URLs and reloads as full pages, and make the dialog's expand action navigate to that page.

**Independent Test**: Open the Issue URL in a new tab and refresh it; both show a full page. Expand from the dialog, then use browser Back and confirm return to the original view.

### Implementation for User Story 2

- [X] T010 [US2] Distinguish first application render from in-session masked navigation in `apps/web/src/app/App.tsx`; on first render resolve `location.mask` as a full Issue route, including after refresh.
- [X] T011 [US2] Implement the modal expand action in `apps/web/src/features/issues/IssueDetailPage.tsx` to replace the masked history entry with its Issue path/search and clear the mask while retaining the safe `returnTo`.
- [X] T012 [US2] Pass the resolved masked Issue route and return target to `AppShell` in `apps/web/src/app/App.tsx` so a full-page masked reload shows the correct Issue route and return navigation.

**Checkpoint**: Direct URL, reload, expand, and Back behavior all match the navigation contract.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete feature against the design and project constraints

- [X] T013 [P] Update the runnable acceptance steps in `specs/040-issue-detail-dialog/quickstart.md` to match the implemented dialog and history behavior.
- [X] T014 Run `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd --filter @gitea-portal/web exec storybook build`; resolve feature-caused failures and record outcomes in `specs/040-issue-detail-dialog/quickstart.md`.
- [X] T015 Complete the browser scenarios in `specs/040-issue-detail-dialog/quickstart.md` for all three views, reload/direct URLs, keyboard access, all locales, narrow layout, and preserved Kanban/Gantt operations.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Already satisfied by the existing Web workspace and React Router dependency.
- **Foundational (Phase 2)**: T001 must finish before route parsing is used by the stories.
- **User Story 1 (Phase 3)**: Depends on T001; T002–T009 deliver the primary overlay journey.
- **User Story 2 (Phase 4)**: Depends on the masked dialog path established in User Story 1.
- **Polish (Phase 5)**: Depends on both user stories.

### User Story Dependencies

- **US1 (P1)**: Requires only T001. It is the MVP slice.
- **US2 (P2)**: Integrates with the dialog from US1 to provide direct/full-page behavior.

### Parallel Opportunities

- T006 (translations) and T008 (dialog CSS) touch separate files and can proceed independently after the dialog labels/layout are agreed.
- T013 (quickstart wording) can proceed independently from source implementation until final results are recorded.
- The remaining feature tasks share App, Issue detail, route, or view files and should be completed sequentially in listed order.

## Implementation Strategy

### MVP First

1. Complete T001, then T002–T009 for User Story 1.
2. Validate opening/closing from the three views and confirm work-view interactions remain intact.
3. Complete T010–T012 for direct URLs, reloads, expansion, and Back behavior.
4. Complete T013–T015 before declaring the feature converged.

## Notes

- Every task uses `- [ ] T### [P?] [US?] ...` format and names its target file path.
- No API, domain, Gitea contract, or Portal persistence changes are in scope.
- `quickstart.md` is the manual browser acceptance guide; automated test files are not required by the specification.
