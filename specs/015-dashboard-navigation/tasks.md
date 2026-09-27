# Tasks: Dashboard 與共通工作介面

**Input**: Design documents from `/specs/015-dashboard-navigation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No new automated test tasks were requested. Required project typecheck/build and quickstart manual scenarios are included in Polish.

## Phase 1: Setup

**Purpose**: Reuse the existing React/i18n workspace; no dependency or project initialization changes are needed.

## Phase 2: Foundational

**Purpose**: No shared backend, persistence, or contract foundation is required. Each user story can use the existing authenticated list APIs and AppShell.

---

## Phase 3: User Story 1 - 從 Dashboard 瀏覽所有工作區 (Priority: P1) 🎯 MVP

**Goal**: Make Dashboard the root/default page and show the complete readable Repository and cross-repository Board directory.

**Independent Test**: Open `/` and `/dashboard`; confirm both show the directory, all readable workspaces appear, inaccessible Boards are omitted, and loading/empty/error states are distinct. Confirm `/issues` remains the all-Issues page.

### Implementation for User Story 1

- [X] T001 [US1] Add `/dashboard` route resolution, map `/` to the Dashboard route, and render `DashboardPage` while preserving `/issues` in `apps/web/src/app/routes.ts` and `apps/web/src/app/App.tsx`.
- [X] T002 [P] [US1] Build typed Repository and readable cross-repository Board directory items, with same-origin Issues destinations and full-Repository readability filtering, in `apps/web/src/features/dashboard/workspace-directory.ts`.
- [X] T003 [US1] Implement `DashboardPage` using both existing list APIs, with loading/empty/error/retry states and no partial list presented as complete; suppress duplicate header selector errors on Dashboard in `apps/web/src/features/dashboard/DashboardPage.tsx` and `apps/web/src/components/layout/WorkspaceSelector.tsx`.
- [X] T004 [P] [US1] Add Dashboard headings, workspace labels, loading/empty/error/retry text for zh-TW/en/ja and register the resource in `apps/web/src/i18n/resources/dashboard.ts`, `apps/web/src/i18n/index.ts`, and `apps/web/src/i18n/i18next.d.ts`.
- [X] T005 [US1] Style responsive workspace cards and their accessible focus/hover states in `apps/web/src/index.css`.

**Checkpoint**: `/` and `/dashboard` render a complete read-only directory; `/issues` and existing workspace routes remain intact.

---

## Phase 4: User Story 2 - 使用品牌與 Dashboard 導覽 (Priority: P1)

**Goal**: Show a non-link Gitea brand and a directly adjacent, accessible Dashboard link throughout the app shell.

**Independent Test**: On Dashboard, Kanban, and Gantt, verify the same Gitea mark and `Gitea Portal` text; verify the brand is not focusable/clickable and Dashboard is a keyboard-operable active link to `/dashboard`.

### Implementation for User Story 2

- [X] T006 [US2] Replace the linked `Gitea Issue Portal` brand with a non-interactive local Gitea SVG mark and `Gitea Portal` text, place the Dashboard anchor immediately beside it with correct active-page semantics, and update the tab title in `apps/web/src/components/layout/AppShell.tsx`, `apps/web/public/favicon.svg`, and `apps/web/index.html`.
- [X] T007 [P] [US2] Add responsive brand/Dashboard navigation layout and visible focus treatment without hiding the workspace selector or account menu in `apps/web/src/index.css`.
- [X] T008 [US2] Add Dashboard and All workspaces labels to all supported locales in `apps/web/src/i18n/resources/common.ts`.

**Checkpoint**: All routes using AppShell display the same brand and Dashboard navigation; existing workspace/account controls remain usable.

---

## Phase 5: User Story 3 - 在 Dashboard、Kanban 與 Gantt Chart 使用一致介面 (Priority: P1)

**Goal**: Keep Dashboard, Kanban, and Gantt in the shared AppShell/page-heading layout and remove only Repository-specific return-to-Issues controls.

**Independent Test**: Compare shared header and page-heading hierarchy on Dashboard, Repository Kanban/Gantt, and Board Kanban/Gantt. Repository Kanban/Gantt have no dedicated return-to-Issues control; Board return-to-settings remains.

### Implementation for User Story 3

- [X] T009 [US3] Remove the Repository-specific return link from `KanbanBoard` while preserving cross-repository Board return navigation in `apps/web/src/features/boards/KanbanBoard.tsx`.
- [X] T010 [US3] Remove the now-unused `returnToRepositoryIssues` translations in zh-TW/en/ja from `apps/web/src/i18n/resources/boards.ts`.
- [X] T011 [US3] Align Dashboard content with the existing `PageHeader` and shared main-content spacing so Dashboard, Kanban, and Gantt use the same page hierarchy in `apps/web/src/features/dashboard/DashboardPage.tsx` and `apps/web/src/index.css`.

**Checkpoint**: The three pages share the same shell and page-heading pattern; view-specific content and Board return behavior remain intact.

---

## Phase 6: Polish & Cross-Cutting Validation

**Purpose**: Validate the complete navigation, workspace visibility, localization, and responsive behavior.

- [X] T012 Run `pnpm.cmd typecheck` and `pnpm.cmd build` from the repository root; fix feature-related failures in the touched source files.
- [X] T013 Execute all manual scenarios in `specs/015-dashboard-navigation/quickstart.md`; all scenarios passed, including authenticated workspace navigation, readability filtering, empty/error states, shared headers, retained Board return navigation, and 390px layout.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No code changes required.
- **Foundational (Phase 2)**: No code changes required.
- **User Stories**: US1 provides the route and Dashboard required by US2. US2 establishes the shared header consumed by US3. Implement sequentially in priority order.
- **Polish**: Depends on all three user stories.

### User Story Dependencies

- **US1 (P1)**: Independent; implement first as the Dashboard MVP.
- **US2 (P1)**: Depends on US1's canonical Dashboard route so its link has a destination.
- **US3 (P1)**: Depends on US2's shared header; its return-link change is otherwise scoped to the Board view.

### Parallel Opportunities

- Within US1, T002 (directory shaping) and T004 (localized strings) touch separate files and can proceed in parallel; T001 is also separate, but T003 integrates T001/T002/T004.
- Within US2, T007 (CSS) and T008 (translations) can proceed in parallel with T006 after the shared link name is agreed.
- US1, US2, and US3 are not independent end-to-end increments because later stories rely on the Dashboard route/shared shell.

## Parallel Example: User Story 1

```text
Task: T002 Build typed workspace directory items in apps/web/src/features/dashboard/workspace-directory.ts
Task: T004 Add/register Dashboard translations in apps/web/src/i18n/resources/dashboard.ts, apps/web/src/i18n/index.ts, and apps/web/src/i18n/i18next.d.ts
```

## Implementation Strategy

### MVP First (User Story 1)

1. Add the Dashboard route and readable-workspace directory.
2. Validate root, `/dashboard`, `/issues`, workspace links, and empty/error behavior.
3. Continue with the common brand/header, then remove the Repository return control.

### Incremental Delivery

1. Complete US1 and verify Dashboard directory behavior.
2. Complete US2 and verify the shared accessible brand/navigation.
3. Complete US3 and verify consistent page hierarchy and scoped return-link removal.
4. Run project typecheck/build and the quickstart scenarios.

## Notes

- `[P]` means tasks touch distinct files and have no dependency on incomplete work.
- Every implementation task names its target file paths.
- No persistence, API endpoint, or Issue data changes are part of this feature.
