# Tasks: Repository 與 All repos 工作區

**Input**: Design documents from `/specs/016-all-repos-workspaces/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/repository-workspaces.md`

**Tests**: No new unit/integration test framework is requested. Add/extend Storybook stories as specified; run the existing typecheck, build, and Storybook build in the final phase.

**Organization**: Tasks are grouped by user story. Foundational tasks extract Board-independent workflow primitives and retire persistence before the stories consume them.

## Phase 1: Setup

**Purpose**: The pnpm workspace, UI stack, and Storybook already exist; no project initialization or dependency changes are needed.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Remove Board-bound foundations while preserving the Gitea workflow behavior needed by both workspace scopes.

- [X] T001 [P] Add neutral workflow-column/card view types in `packages/domain/src/work-view.ts` and update `packages/domain/src/index.ts` exports; remove the Board domain export.
- [X] T002 [P] Remove Board API types and define neutral aggregate/repository view response types in `packages/gitea-contracts/src/portal.ts`.
- [X] T003 Move `apps/api/src/boards/board-view-service.ts` to `apps/api/src/work-views/kanban-service.ts`; retain fixed states, all-page loading, anomaly column, and `visibleLabels` semantics without Board imports.
- [X] T004 Move `apps/api/src/boards/transition-service.ts` to `apps/api/src/issues/workflow-transition-service.ts`; preserve permission checks, atomic Label replacement, expectedUpdatedAt conflicts, assignee order, and recovery behavior, then update `apps/api/src/issues/issue-routes.ts` imports.
- [X] T005 Remove Board store initialization and route registration from `apps/api/src/app.ts`; remove Board route imports and Board-only configuration from `apps/api/src/config/env.ts`.
- [X] T006 Delete Board-only API files `apps/api/src/boards/board-routes.ts`, `board-service.ts`, `board-compatibility.ts`, `board-issue-service.ts`, `gantt-service.ts` and Board-only JSON store files `apps/api/src/persistence/board-repository.ts`, `database.ts` after moving reusable behavior in T003-T004.
- [X] T007 Add neutral frontend work-view types in `apps/web/src/features/work-views/types.ts` and remove Board API/response helpers from `apps/web/src/lib/api.ts`.

**Checkpoint**: No API startup dependency on Board persistence remains; neutral workflow primitives compile conceptually without any collection/settings identity.

## Phase 3: User Story 1 - 在 All repos 檢視工作 (Priority: P1) 🎯 MVP

**Goal**: Provide complete Issues, Kanban, and Gantt views across every repository readable by the current Gitea user; login defaults to All repos Gantt.

**Independent Test**: Use a signed-in account with multiple readable repositories. Verify each view includes all repositories, identifies issues by repository and number, displays no partial aggregate after a required read failure, and returns to the source view after opening Issue detail.

### Implementation

- [X] T008 [US1] Implement All repos Issue aggregation in `apps/api/src/issues/issue-search-service.ts`: enumerate readable repositories, fetch every matching Issue page, apply filters, sort updatedAt descending with owner/name/number tie-breaks, then paginate; fail the whole query on any required read failure.
- [X] T009 [US1] Add `GET /api/repositories/kanban` and `GET /api/repositories/gantt` handlers in `apps/api/src/repositories/repository-routes.ts`; use all readable repositories, all Issue pages, neutral contracts, and whole-request failure semantics.
- [X] T010 [US1] Rename reusable Kanban/Gantt components and stories from `apps/web/src/features/boards/` into `apps/web/src/features/work-views/`, preserving existing Repository presentation and fictional fixtures.
- [X] T011 [US1] Add an All repos view loader in `apps/web/src/features/work-views/WorkspaceViewPage.tsx` that calls aggregate endpoints and shares loading/error/retry rendering between Kanban and Gantt.
- [X] T012 [US1] Extend `apps/web/src/features/issues/IssueListPage.tsx`, `IssueRow.tsx`, and `IssueListPage.stories.tsx` to render All repos repository provenance, preserve aggregate filters/page in detail `returnTo`, and retain single Repository filtering.
- [X] T013 [US1] Extend `apps/web/src/features/work-views/KanbanCard.tsx`, `GanttIssueRow.tsx`, `KanbanCard.stories.tsx`, and `GanttIssueRow.stories.tsx` to show repository identity in All repos while preserving the compact single Repository presentation and source-view return path.
- [X] T014 [US1] Extend `apps/web/src/features/work-views/GanttBoard.tsx` and `KanbanBoard.tsx` to render aggregated rows/columns, empty states, and error/retry states while preserving schedule anomalies and keyboard alternatives to drag transitions.
- [X] T015 [US1] Add fictional multi-repository stories for populated All repos Kanban/Gantt, colliding Issue numbers, loading, empty, and error/retry states in `apps/web/src/features/work-views/KanbanBoard.stories.tsx` and `GanttBoard.stories.tsx`.
- [X] T016 [US1] Update `apps/web/src/app/routes.ts` so `/issues`, `/kanban`, `/gantt` represent All repos views, `/` resolves to All repos Gantt, Repository routes retain scope, `safeReturnTo` accepts supported routes, and unknown paths resolve to not-found.
- [X] T017 [US1] Update `apps/web/src/app/App.tsx` to remove Board route/page loading and render a regular not-found page for retired `/boards...` and other unknown routes.

**Checkpoint**: All repos views are complete, directly navigable, fully aggregated, repository-identifiable, and fail as a unit when required data is missing.

## Phase 4: User Story 2 - 在 Repository 工作區處理工作 (Priority: P1)

**Goal**: Preserve isolated Repository Issues, Kanban, and Gantt behavior and make Issue creation target selection explicit only in All repos.

**Independent Test**: Select one Repository and verify all three views contain only its Issues; create an Issue from that Repository and from All repos and verify target selection behavior and return context.

### Implementation

- [X] T018 [US2] Update `apps/api/src/repositories/repository-workspace-service.ts` to use neutral workflow-view services and preserve Repository-specific all-page Kanban/Gantt response shapes.
- [X] T019 [US2] Update `apps/web/src/features/repositories/RepositoryWorkspacePage.tsx` to use the shared work-view presentation without loading or branching on Board data.
- [X] T020 [US2] Update `apps/web/src/features/issues/IssueCreatePage.tsx` so an All repos entry starts with an empty Repository field and cannot submit until selected; retain preselection when opened from a Repository workspace.
- [X] T021 [US2] Add Storybook stories for explicit All repos target selection and Repository-preselected Issue creation in `apps/web/src/features/issues/IssueCreatePage.stories.tsx`.
- [X] T022 [US2] Rename the `boards` i18n resource to a neutral work-view resource and update `apps/web/src/i18n/index.ts`, `i18next.d.ts`, common/dashboard resources, and component namespaces for zh-TW, en, and ja; remove Board product strings while retaining Kanban/Gantt translations.
- [X] T023 [US2] Update `apps/web/src/components/layout/WorkspaceSelector.tsx` to fetch readable repositories only and provide exactly All repos plus repository choices; remove Board fetch, callback, and option groups.
- [X] T024 [US2] Update `apps/web/src/components/layout/AppShell.tsx` so Issues/Kanban/Gantt links follow current All repos or Repository scope, mark the selected workspace/view, and remove Board Settings navigation.
- [X] T025 [US2] Add Storybook stories for All repos and Repository selector states in `apps/web/src/components/layout/WorkspaceSelector.stories.tsx`; verify scope selection, visible focus, and responsive layouts with the existing light/dark toolbar.

**Checkpoint**: Repository-scoped workflows remain isolated; users can switch scopes from the shared selector, and All repos creation cannot silently target the first repository.

## Phase 5: User Story 3 - 使用精簡且一致的工作區介面 (Priority: P1)

**Goal**: Complete the All repos and Repository experience by removing remaining Board pages, polishing responsive/accessibility states, retaining the optional Dashboard directory, and updating current docs/runtime data.

**Independent Test**: Confirm Dashboard lists All repos and readable repositories, retired Board pages/configuration/data are absent, and the completed views remain legible in narrow layouts, keyboard navigation, and light/dark themes.

### Implementation

- [X] T026 [US3] Update `apps/web/src/features/dashboard/workspace-directory.ts` and `DashboardPage.tsx` to show All repos and readable Repository entries without Board API calls or Board item types; keep `/dashboard` as an optional directory.
- [X] T027 [US3] Remove `BoardIssuesPage.tsx`, `BoardListPage.tsx`, `BoardEditor.tsx`, and `LegacyBoardNoticePage.tsx` from `apps/web/src/features/boards/`; remove their imports from `apps/web/src/app/App.tsx`, `DashboardPage.tsx`, and `WorkspaceSelector.tsx`.
- [X] T028 [US3] Update `apps/web/src/index.css` selectors and responsive states for the renamed work-view UI; preserve semantic tokens, visible focus, reduced motion, dark mode contrast, mobile column selection, and non-drag transition controls.
- [X] T029 [US3] Update `README.md`, `AGENTS.md`, and `.env.example` to describe All repos/Repository workspaces and the no-mirror, permission, fixed-workflow rules; remove Board persistence, URL, and configuration instructions.
- [X] T030 [US3] Remove the configured Board JSON, lock/temp files, and `BOARD_STORE_PATH` entry from the local `.env`; delete `data/boards.json` without exposing or altering unrelated environment values.

**Checkpoint**: The selector and current product/contributor documentation expose only All repos and Repository workspaces; retired URLs have no route or API compatibility behavior.

## Phase 6: Polish & Cross-Cutting Validation

**Purpose**: Validate contracts, design states, documentation, and retired-feature cleanup across the complete feature.

- [X] T031 Search `apps/api/`, `apps/web/`, `packages/`, `README.md`, `AGENTS.md`, `.env.example`, and `.env` for `/api/boards`, `/boards`, active Board UI labels/types, and `BOARD_STORE_PATH`; remove active product/runtime references while leaving historical completed feature specs intact.
- [X] T032 Run `pnpm.cmd typecheck` and `pnpm.cmd build` from the repository root; resolve errors across API, web, domain, and Gitea contracts.
- [X] T033 Run `pnpm.cmd --filter @gitea-portal/web build-storybook`; resolve broken or missing stories for workspace, Issues, Kanban, Gantt, async states, viewport, and themes.
- [ ] T034 Complete every signed-in scenario in `specs/016-all-repos-workspaces/quickstart.md` and record any unavailable Gitea permission/failure fixture instead of claiming unverified coverage.
  - 執行記錄（2026-09-28）：本機 3000、3001、5173 均無服務監聽，無法登入 Gitea 執行簽入情境；未宣稱這些情境已驗證。

## Dependencies & Execution Order

### Phase Dependencies

- **Setup**: No changes; the current workspace and Storybook are already configured.
- **Foundational**: Complete T001-T007 before user-story work; T003/T004 must precede deletion of their original files in T006.
- **US1**: Depends on neutral contracts/services; complete aggregation and routing before the All repos view can be tested independently.
- **US2**: Depends on the shared view implementation from US1; delivers the scope selector/shell navigation alongside Repository-scoped endpoints and explicit Issue target selection.
- **US3**: Completes Dashboard directory, remaining accessibility/presentation, docs and runtime data cleanup.
- **Polish**: Run after all three stories and cleanup.

### User Story Dependencies

- **User Story 1 (P1)** is the MVP and provides the complete, directly navigable All repos data views.
- **User Story 2 (P1)** uses the shared work-view presentation from US1 and completes the selector/navigation needed to choose a Repository scope.
- **User Story 3 (P1)** completes Dashboard, remaining visual/accessibility polish, docs and runtime data cleanup after the main workspace flows are usable.

### Parallel Opportunities

- T001 and T002 touch separate contract files and can run in parallel.
- After T003/T004, T005/T006 API cleanup can proceed while frontend work is underway, provided shared imports are coordinated.
- In US1, T008 and T009 can proceed in parallel; Storybook T015 can proceed after T010 and neutral types without waiting for signed-in Gitea validation.
- In US2, T022 can proceed alongside backend tasks; T023/T024 use its registered translations and should follow it. T025 can run after the selector behavior is implemented.
- In US3, T026, T028, and T029 touch separate files and can proceed in parallel.
- Keep tasks touching `App.tsx`, `routes.ts`, `AppShell.tsx`, or shared i18n registration sequential to avoid conflicts.

## Implementation Strategy

1. Remove Board storage/API foundations while extracting neutral workflow/transition behavior.
2. Deliver All repos aggregated views as the MVP; verify full data scope, provenance, route and whole-view errors.
3. Preserve single Repository workflows and make cross-scope Issue creation explicit.
4. Integrate selector, Dashboard directory, localization, Storybook states, documentation and configured data cleanup.
5. Run typecheck, production build, Storybook build, then signed-in quickstart scenarios.
