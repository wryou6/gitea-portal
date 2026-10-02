---
description: "Tasks for assignee filter defaults and shortcuts"
---

# Tasks: 負責人快速篩選

**Input**: Design documents from `specs/024-assignee-filter-shortcuts/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/assignee-filter-controls.md`, `quickstart.md`

**Tests**: No new automated test suite requested. Update fixture-based Storybook examples and perform the validation in `quickstart.md`.

**Organization**: Tasks are grouped by user story. Shared URL semantics are foundational because all views use the same query state.

## Phase 1: Setup

No project setup or dependency changes are required.

## Phase 2: Foundational

**Purpose**: Define shared all/me/login assignee semantics before integrating the views.

- [x] T001 Update shared filter parsing, serialization, matching, and active-filter counting so missing assignee means all, `me` resolves against the current login, and all is omitted from URLs in `apps/web/src/features/work-views/work-view-filters.ts`.

**Checkpoint**: Shared filtering distinguishes all, recipient-relative me, unassigned, and explicit login without an `assignee=all` query.

## Phase 3: User Story 1 - 預設查看自己的工作 (Priority: P1) 🎯 MVP

**Goal**: Portal-generated default view links use recipient-relative me in All repos and Repository workspaces; direct URLs without assignee show all.

**Independent Test**: Open all six view/workspace combinations from Portal-generated default links and confirm each carries `assignee=me`; open a direct URL without assignee and confirm it shows all; clear filters and confirm it returns to me.

### Implementation for User Story 1

- [x] T002 Pass the authenticated login to issue matching and resolve `me` to the real login for List API filters and Gantt/Kanban client filtering in `apps/web/src/features/issues/IssueListPage.tsx`, `apps/web/src/features/issues/issue-list-state.ts`, `apps/web/src/features/work-views/KanbanBoard.tsx`, and `apps/web/src/features/work-views/GanttBoard.tsx`.
- [x] T003 Add `assignee=me` to Portal-generated default view links from non-view contexts while preserving current query state when switching views or workspaces in `apps/web/src/components/layout/AppShell.tsx` and `apps/web/src/components/layout/WorkspaceSelector.tsx`.

**Checkpoint**: Portal defaults open as me, direct queryless URLs remain all, and view/workspace navigation preserves either choice.

## Phase 4: User Story 2 - 快速切換負責人範圍 (Priority: P1)

**Goal**: Provide keyboard-accessible self and all-assignees actions that only change the assignee condition.

**Independent Test**: In each view, activate both shortcuts and confirm the assignee and result change immediately while all other filters remain unchanged.

### Implementation for User Story 2

- [x] T004 Re-layout the assignee controls as wider me/all shortcut buttons followed by a directly expandable native select, and render priority, type, and status as mutually exclusive clickable Badge options including all; preserve keyboard order, selected states, active-filter clear behavior, and narrow-panel wrapping in `apps/web/src/features/work-views/WorkViewFilterBar.tsx`, `apps/web/src/features/work-views/work-view-filter-labels.ts`, and `apps/web/src/index.css`.
- [x] T005 Add localized select prompt and shortcut labels in Traditional Chinese, English, and Japanese in `apps/web/src/i18n/resources/work-views.ts`.

**Checkpoint**: Both shortcuts work from the shared filter bar in List, Kanban, and Gantt, including keyboard use.

## Phase 5: User Story 3 - 分享及還原負責人篩選 (Priority: P2)

**Goal**: Restore recipient-relative me, queryless all, and explicitly selected login states from URLs.

**Independent Test**: Open URLs with `assignee=me`, no assignee, and another login, then verify the respective filters in all three views.

### Implementation for User Story 3

- [x] T006 Add fixture-based stories for Portal default me, direct queryless all, explicit me, selected login, changing a selected login without clearing, clear-button disabled states, selected Badge options for priority/type/status, and All repos/Repository scope in `apps/web/src/features/work-views/WorkViewFilterBar.stories.tsx`, `apps/web/src/features/issues/IssueListPage.stories.tsx`, `apps/web/src/features/work-views/KanbanBoard.stories.tsx`, and `apps/web/src/features/work-views/GanttBoard.stories.tsx`.

**Checkpoint**: Filter URLs restore correctly and Storybook demonstrates the required shortcut states without live API calls.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate URL preservation, localization, accessibility, and existing workspace behavior.

- [x] T007 Run `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd --filter @gitea-portal/web build-storybook`, then correct any failures in the owning source files.
- [ ] T008 Complete the authenticated browser scenarios in `specs/024-assignee-filter-shortcuts/quickstart.md` across List, Kanban, and Gantt, including responsive layout, keyboard controls, recipient-relative URL behavior, and read-only behavior.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No setup work is required.
- **Foundational (Phase 2)**: T001 defines the filter URL semantics and blocks view integration.
- **User Story 1 (Phase 3)**: Depends on T001; resolve `me` consistently in the views and generate default links.
- **User Story 2 (Phase 4)**: Depends on T001 and T002; the shared component receives the login and updates the same filter state.
- **User Story 3 (Phase 5)**: Depends on T001-T005; stories demonstrate the integrated URL and button behavior.
- **Polish (Phase 6)**: Depends on all user-story implementation tasks.

### User Story Dependencies

- **US1 (P1)**: Starts after T001; provides Portal `me` defaults and queryless `all` across all views.
- **US2 (P1)**: Starts after T001 and login propagation in US1; integrates with the common filter bar.
- **US3 (P2)**: Uses the URL behavior from T001 and adds fixture coverage after the controls are integrated.

### Parallel Opportunities

- T004 and T005 touch separate UI and locale files and can proceed in parallel after T002.
- In T006, List, Kanban, and Gantt story files can be updated independently if split by file ownership.

## Implementation Strategy

### MVP First

1. Complete T001-T003 to establish `me` defaults in Portal navigation and all semantics for direct URLs in List, Kanban, and Gantt.
2. Complete T004-T005 to deliver the quick shortcuts and localized controls.
3. Complete T006-T007 to demonstrate and validate URL, dropdown, accessibility, and workspace behavior.

### Format Validation

Every task has a checkbox, sequential task ID, applicable story label, an imperative description, and concrete project paths or validation guide.
