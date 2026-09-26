---
description: "Implementation tasks for the collapsible sidebar navigation feature"
---

# Tasks: 可收合側邊導覽

**Input**: Design documents from `specs/006-collapsible-sidebar-navigation/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: No automated test tasks are included; the specification did not request new tests. The final polish task runs the project-required typecheck and build.

**Organization**: Tasks are grouped by user story so each story maps to an independently reviewable increment.

## Phase 1: Setup

**Purpose**: Project initialization and basic structure.

The pnpm workspace, React/Vite app, global stylesheet and shared shell already exist. No setup changes are needed.

## Phase 2: Foundational

**Purpose**: Blocking shared infrastructure required before story work.

The existing `AppShell`, hand-written route matching and global CSS provide the required foundation. No new API, package, database or Board persistence setup is required.

---

## Phase 3: User Story 1 - 從側欄前往工作頁面 (Priority: P1) 🎯 MVP

**Goal**: Keep the top brand bar, move the four primary destinations to a shared sidebar, and preserve Board selection intent.

**Independent Test**: From an Issue page, reach Issues and each Board destination; from a Board view, switch Kanban/Gantt without changing its Board; from Board Settings, retain the existing management entry.

### Implementation for User Story 1

- [x] T001 [P] [US1] Replace the Issues/Boards top links with four icon-and-label sidebar destinations and current-page indication in `apps/web/src/components/layout/AppShell.tsx` (FR-001, FR-002, FR-003, FR-004, FR-007, FR-010).
- [x] T002 [P] [US1] Parse the `view=kanban|gantt` selection intent on `/boards` and pass it to Board selection in `apps/web/src/app/App.tsx` (FR-005, FR-006).
- [x] T003 [US1] Make Board list entries open the chosen Board in the requested Kanban/Gantt view while keeping plain `/boards` as management in `apps/web/src/features/boards/BoardListPage.tsx` (FR-005, FR-006, FR-007, FR-013).
- [x] T004 [US1] Add the shared topbar/sidebar/content grid and desktop navigation layout in `apps/web/src/index.css` (FR-001, FR-002, FR-011).

**Checkpoint**: All four sidebar destinations work from Issue and Board pages; Board view intent and existing Board management remain distinct.

---

## Phase 4: User Story 2 - 收合或展開側欄 (Priority: P1)

**Goal**: Let users switch between icon-and-label and icon-only sidebar states and retain the choice for the current browser session.

**Independent Test**: Toggle both directions, navigate to another page and reload; the selected state remains for the current session, while a new session starts expanded.

### Implementation for User Story 2

- [x] T005 [US2] Add the keyboard-operable sidebar toggle and session-scoped expanded state in `apps/web/src/components/layout/AppShell.tsx` (FR-008, FR-010, FR-014).
- [x] T006 [US2] Style expanded and icon-only widths, visibility and toggle affordance in `apps/web/src/index.css` (FR-003, FR-008, FR-014).

**Checkpoint**: The visible labels and icons match each state, navigation remains available, and the state lasts exactly for the current session.

---

## Phase 5: User Story 3 - 在窄視窗與鍵盤操作導覽 (Priority: P2)

**Goal**: Keep sidebar names, keyboard access, focus and primary content available at narrow viewport widths.

**Independent Test**: At 320px and 375px widths, use only the keyboard to expand/collapse and activate all four entries; confirm the sidebar pushes layout without covering or clipping the page content.

### Implementation for User Story 3

- [x] T007 [P] [US3] Add accessible names to icon-only links, `aria-expanded` to the toggle and visible focus behavior in `apps/web/src/components/layout/AppShell.tsx` (FR-009, FR-010).
- [x] T008 [P] [US3] Add narrow-viewport sidebar and content reflow rules without an overlay in `apps/web/src/index.css` (FR-011).

**Checkpoint**: Icon-only navigation remains identifiable to keyboard and assistive technology users; sidebar does not obscure the main page.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete feature against project requirements.

- [ ] T009 Run the acceptance scenarios in `specs/006-collapsible-sidebar-navigation/quickstart.md`, then run `pnpm.cmd typecheck` and `pnpm.cmd build`; resolve any failures in the touched `apps/web/src/` files (FR-012, SC-001–SC-006).

> Partial verification: browser checks confirmed the four routes, session persistence across reload, expanded default in a new tab, keyboard operation, and non-overlay layouts at 320px and 375px. Board-backed selection and CRUD flows remain unverified because the local Portal reports `Authentication required`. `pnpm.cmd typecheck` and `pnpm.cmd build` passed when retried with elevated execution after sandboxed runs returned Windows `spawn EPERM`.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No work; existing project structure is sufficient.
- **Foundational (Phase 2)**: No work; existing shell and route handling are sufficient.
- **User Story 1 (Phase 3)**: Starts immediately; establishes the sidebar destinations and Board selection behavior.
- **User Story 2 (Phase 4)**: Depends on User Story 1 because it adds state and behavior to the sidebar created there.
- **User Story 3 (Phase 5)**: Depends on User Stories 1 and 2 because accessibility and narrow layout apply to the completed sidebar.
- **Polish (Phase 6)**: Depends on all three stories.

### User Story Dependencies

- **US1 (P1)**: Independent; can be implemented first.
- **US2 (P1)**: Depends on the US1 sidebar structure.
- **US3 (P2)**: Depends on the final US1/US2 sidebar markup and states.

### Parallel Opportunities

- **T001** and **T002** can run in parallel; they touch separate files and define separate navigation concerns.
- **T007** and **T008** can run in parallel after US1/US2; markup accessibility and responsive layout use separate files.
- Tasks touching `AppShell.tsx` or `index.css` within the same story must be sequenced if they are not listed as a parallel pair.

## Parallel Example: User Story 1

```text
Task: T001 — sidebar destinations and active state in AppShell.tsx
Task: T002 — Board view-intent routing in App.tsx
```

## Implementation Strategy

Deliver the two P1 stories together as the MVP: global sidebar navigation and session-scoped collapse behavior. Complete P2 keyboard/accessibility and narrow-screen requirements before calling the feature done, then run the project-required typecheck/build checks.

## Notes

- No automated test tasks are added because neither the feature specification nor the user requested new tests.
- Board selection intent is navigation-only; it does not alter Board or Issue storage.
- The navigation preference is browser-session UI state and must not be added to the Board JSON store or server API.

## Phase 7: Convergence

- [ ] T010 Complete the authenticated Board acceptance scenarios in `quickstart.md`: same-Board Kanban/Gantt switching, requested-view Board selection, empty/error return behavior, and Board list/create/edit; record results and close T009 per SC-003 and US1/AC3–7 (partial).

## Phase 8: Canonical Route Redesign

- [x] T011 Introduce canonical UI route helpers and resolve `/issues`, `/issues/new`, `/issues/:owner/:repo/:number`, `/kanban`, `/gantt`, `/boards`, and `/boards/:boardId/:view`; update internal links and preserve legacy aliases per FR-015 and SC-007 (missing).
- [x] T012 Keep `/kanban` and `/gantt` as Board-only selection pages, route empty selection to Board Settings, and suppress management controls or false empty states there/on data failure per FR-006 and acceptance scenarios 4–5 (completed).
