# Tasks: 站內畫面切換不閃白

**Input**: Design documents from `specs/033-spa-navigation/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: No new automated test suite is requested. Use the existing typecheck/build/Storybook checks and the authenticated browser scenarios in `quickstart.md`.

**Organization**: Tasks are grouped by user story; the shared Router setup blocks all stories.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel in separate files with no incomplete dependencies.
- **[Story]**: User story served by the task.
- Every task includes the relevant project file path or validation artifact.

## Phase 1: Setup

**Purpose**: Add the selected navigation dependency.

- [X] T001 Add the React Router declarative `react-router` dependency compatible with React 19 to `apps/web/package.json` and update the root `pnpm-lock.yaml`.

---

## Phase 2: Foundational

**Purpose**: Establish Router context and make location changes render through the existing route resolver.

- [X] T002 Mount one `BrowserRouter` around `App` in `apps/web/src/main.tsx` after session bootstrap, then read Router location in `apps/web/src/app/App.tsx` and pass current pathname/search to `AppShell` while retaining `resolveAppRoute`.

**Checkpoint**: `App` and its shared shell respond to Router location updates; auth bootstrap still occurs once per document load.

---

## Phase 3: User Story 1 - 切換 Portal 畫面時不中斷操作 (Priority: P1) 🎯 MVP

**Goal**: Same-origin Portal navigation updates the page in place and keeps the shared shell mounted.

**Independent Test**: Use the sidebar, Dashboard, workspace selector, search, and Issue links to navigate among Portal pages; confirm no new document navigation and the shell remains visible.

- [X] T003 [P] [US1] Convert Dashboard, Settings, sidebar, account-menu, and Repository workspace return links to Router `Link` in `apps/web/src/components/layout/AppShell.tsx`, `apps/web/src/features/dashboard/DashboardPage.tsx`, and `apps/web/src/features/repositories/RepositoryWorkspacePage.tsx`.
- [X] T004 [P] [US1] Convert Issue List, Kanban, Gantt, Issue detail, and Issue return anchors to Router `Link` in `apps/web/src/features/issues/IssueRow.tsx`, `apps/web/src/features/issues/IssueDetailPage.tsx`, `apps/web/src/features/issues/IssueCreatePage.tsx`, `apps/web/src/features/work-views/KanbanCard.tsx`, and `apps/web/src/features/work-views/GanttIssueRow.tsx`.
- [X] T005 [US1] Convert Global Issue Search result links and replace event-driven full-page navigation with `useNavigate` for sidebar view changes, workspace selection, keyboard-selected search results, and successful Issue creation in `apps/web/src/components/layout/AppShell.tsx`, `apps/web/src/components/layout/WorkspaceSelector.tsx`, `apps/web/src/components/layout/GlobalIssueSearch.tsx`, and `apps/web/src/features/issues/IssueCreatePage.tsx`, reusing existing route and work-view URL builders.
- [X] T006 [US1] Keep OAuth, logout, and external Gitea destinations as document navigations and verify modifier-click/new-tab behavior for Router links in `apps/web/src/components/layout/AppShell.tsx`, `apps/web/src/features/auth/LoginPage.tsx`, and `apps/web/src/features/issues/IssueDetailPage.tsx`.

---

## Phase 4: User Story 2 - 保留切換前後的工作脈絡 (Priority: P1)

**Goal**: Router navigation preserves canonical URL state and restores it through browser history.

**Independent Test**: Apply repeated filters, List sorting, and Gantt date/scale; navigate between workspaces/views and Issue pages; verify URLs, results, and Back/Forward restoration against Features 030 and 031.

- [X] T007 [P] [US2] Route List query writes through `useNavigate` with the existing push-versus-replace behavior in `apps/web/src/features/issues/issue-list-state.ts` while continuing to serialize filters with `work-view-url-state.ts` helpers.
- [X] T008 [P] [US2] Route Kanban filter history updates through `useNavigate` and restore filters/results from Router location changes in `apps/web/src/features/work-views/KanbanBoard.tsx`.
- [X] T009 [P] [US2] Route Gantt date/scale URL synchronization through `useNavigate` with replace semantics and use Router location as the current query source in `apps/web/src/features/work-views/GanttBoard.tsx`.
- [X] T010 [US2] Update List and work-view state restoration to respond to Router POP/location changes without duplicate raw `popstate` listeners in `apps/web/src/features/issues/IssueListPage.tsx` and `apps/web/src/features/work-views/KanbanBoard.tsx`; preserve existing repeated-query and `returnTo` rules from `apps/web/src/features/work-views/work-view-url-state.ts`.

---

## Phase 5: User Story 3 - 直接開啟或重整 Portal 網址 (Priority: P2)

**Goal**: Existing Portal routes continue to load from a direct URL and refresh.

**Independent Test**: Open and refresh Dashboard, work-view, Repository workspace, and Issue detail URLs; confirm invalid paths still show Not Found.

- [X] T011 [P] [US3] Verify direct route loading and refresh for all route families through the Vite SPA fallback in `apps/web/vite.config.ts`; document production host fallback and API/auth routing requirements in `specs/033-spa-navigation/quickstart.md` without inventing an unconfigured host integration.
- [X] T012 [P] [US3] Verify unknown paths remain handled by the existing `not-found` route from `apps/web/src/app/routes.ts` when rendered under Router context.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Keep isolated component stories usable and record implementation acceptance evidence.

- [X] T013 [P] Add a global `MemoryRouter` wrapper to the Storybook decorator in `apps/web/.storybook/preview.tsx` so stories using Router links or hooks render with Router context.
- [X] T014 Run `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd --filter @gitea-portal/web build-storybook`; confirm authenticated Issue operations still use existing APIs without permission or persistence changes, and record navigation timing/no-full-screen-blank Playwright results in `specs/033-spa-navigation/quickstart.md`.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 adds the Router dependency.
- **Foundational (Phase 2)**: T002 depends on T001 and blocks all user stories.
- **US1 (Phase 3)**: Depends on T002; supplies in-place page navigation.
- **US2 (Phase 4)**: Depends on T002; URL writers and view-state restoration must use Router location/navigation.
- **US3 (Phase 5)**: Depends on T002; validates hard loads independently of in-app navigation.
- **Polish (Phase 6)**: T013 can proceed after T001; T014 depends on all prior tasks.

### User Story Dependencies

- **US1 (P1)**: Can begin after the foundational Router setup.
- **US2 (P1)**: Can begin after the foundational Router setup; it must be complete before declaring route state acceptance.
- **US3 (P2)**: Can begin after the foundational Router setup and can be validated independently of US1/US2; deep-link checks target the current local Vite environment only.
- Within US1, T005 follows T003/T004 because it shares AppShell and IssueCreatePage files.
- Within US2, T010 follows T008 because both update Kanban history restoration behavior.

### Parallel Opportunities

- After T002, T003 and T004 touch different files and may be parallelized.
- T007, T008, and T009 touch separate URL-state owners and may be parallelized; T010 integrates their browser-history restoration.
- T011 and T012 may be parallelized after T002.
- T013 may be done independently after the Router dependency is available.

## Implementation Strategy

### MVP First (User Story 1)

1. Complete T001 and T002.
2. Complete T003–T006 so same-origin Portal links and imperative destinations use Router navigation.
3. Validate in-place switching and AppShell continuity before migrating URL writers.

### Incremental Delivery

1. Complete US1 for continuous route transitions.
2. Complete US2 for URL, filters, Issue returns, and browser history correctness.
3. Complete US3 for hard-load and refresh support.
4. Complete Storybook and end-to-end validation, then record results in the quickstart.

## Notes

- Keep the existing route resolver and URL policy; do not add a second route-to-page mapping or rewrite API data loaders.
- Never call raw `history.pushState`/`replaceState` for application route state after Router is introduced.
- Full-document OAuth, logout, external Gitea, and external link flows remain unchanged.
