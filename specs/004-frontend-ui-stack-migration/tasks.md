---
description: "Implementation tasks for the frontend UI stack migration"
---

# Tasks: 前端 UI 技術棧遷移

**Input**: Design documents from `specs/004-frontend-ui-stack-migration/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui-api-preservation.md`, `quickstart.md`

**Implementation boundary**: Presentation layer only. Do not modify `apps/api/src`, shared Gitea contracts, Board JSON persistence, authentication, authorization, or API payload semantics. New framework structure takes priority over initial feature parity; temporary frontend behavior gaps are acceptable and must not be hidden by retaining obsolete UI.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install and configure the selected frontend presentation tools without changing runtime behavior.

- [x] T001 Update `apps/web/package.json` with Tailwind CSS, shadcn/ui support dependencies, Chart.js, Storybook React/Vite, and one SVG icon family; record direct dependency licenses in `apps/web/THIRD-PARTY-NOTICES.md`.
- [x] T002 [P] Configure Tailwind CSS 4 and the Vite integration in `apps/web/vite.config.ts`, preserving the existing React plugin and dev/build behavior.
- [x] T003 [P] Configure Storybook React/Vite in `apps/web/.storybook/main.ts` and `apps/web/.storybook/preview.tsx` without adding a second application entry point.
- [x] T004 [P] Add the web package Storybook scripts and any required TypeScript/config files in `apps/web/package.json` and `apps/web/tsconfig.json`.
- [x] T005 [P] Add repository-owned frontend dependency/license notes in `apps/web/THIRD-PARTY-NOTICES.md` and document that the design reference is global-only in `specs/004-frontend-ui-stack-migration/research.md`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared tokens, utilities, primitives, and feedback contracts that every page migration depends on.

**Checkpoint**: Shared presentation foundation builds successfully before feature pages are migrated.

- [x] T006 Create semantic light/dark design tokens, Tailwind theme aliases, base typography, responsive behavior, reduced-motion rules, and global focus styles in `apps/web/src/index.css`.
- [x] T007 Create the class-merging and variant utilities used by source-owned UI components in `apps/web/src/lib/utils.ts`.
- [x] T008 [P] Implement accessible source-owned primitives for Button, Badge, Card, Input, Textarea, Select, Checkbox, Label, Separator, Table, Dialog, Sheet, DropdownMenu, Skeleton, and Alert in `apps/web/src/components/ui/`.
- [x] T009 [P] Implement shared application shell and responsive layout primitives in `apps/web/src/components/layout/AppShell.tsx`, `apps/web/src/components/layout/PageHeader.tsx`, and `apps/web/src/components/layout/ResponsiveToolbar.tsx`.
- [x] T010 [P] Migrate Loading, Empty, Error, and Permission feedback components to the new primitives in `apps/web/src/components/feedback/LoadingState.tsx`, `apps/web/src/components/feedback/EmptyState.tsx`, `apps/web/src/components/feedback/ErrorNotice.tsx`, and `apps/web/src/components/feedback/PermissionDenied.tsx`.
- [x] T011 [P] Create Storybook-safe dummy fixtures and shared story metadata in `apps/web/src/stories/fixtures.ts` and `apps/web/src/stories/README.md`, with no credentials or real operational Issue data.
- [x] T012 Verify the new foundation against the existing API client boundary in `apps/web/src/lib/api.ts`; preserve same-origin credentials, CSRF headers, request paths, and error propagation for any retained operation, while allowing incomplete UI flows to be recorded as follow-up work.

---

## Phase 3: User Story 1 - 以新版介面瀏覽跨 Repository Issues (Priority: P1) 🎯 MVP

**Goal**: Replace the Issues list, filters, rows, labels, loading, empty, error, search, filtering, and pagination presentation while prioritizing the new framework structure.

**Independent Test**: With dummy Issues from multiple Repositories, open `/`, combine available filters, inspect all required fields, and verify the new component states at supported widths.

### Implementation for User Story 1

- [x] T013 [P] [US1] Rebuild Issue filter controls with labelled responsive fields, active-filter summary, pending state, and error association in `apps/web/src/features/issues/IssueFilters.tsx`.
- [x] T014 [P] [US1] Rebuild Issue labels and workflow display presentation using Badge and semantic status tokens in `apps/web/src/features/issues/LabelList.tsx`; remove workflow-only presentation files that are no longer needed after the new card/list design.
- [x] T015 [P] [US1] Rebuild the Issue row/table presentation with Repository, Issue number, title, state, assignee, labels, milestone, updated time, and original Gitea link in `apps/web/src/features/issues/IssueRow.tsx`.
- [x] T016 [US1] Integrate the new filter, table/list, pagination, loading, empty, and error components into `apps/web/src/features/issues/IssueListPage.tsx`; use the existing route/API behavior where it fits the new framework and record any temporary parity gap.
- [x] T017 [US1] Update the top-level route shell and navigation styling for the Issue list in `apps/web/src/app/App.tsx` and `apps/web/src/main.tsx`; route matching/API preservation is preferred but not a reason to retain the old UI system.

**Checkpoint**: User Story 1 uses the new UI from `/`.

---

## Phase 4: User Story 2 - 使用新版介面完成 Issue 生命週期操作 (Priority: P1)

**Goal**: Replace Issue creation, detail, state controls, comments, and feedback presentation using the new framework primitives.

**Independent Test**: Inspect the create/detail/edit/comment states with dummy data and verify retained mutations use the Gitea API boundary.

### Implementation for User Story 2

- [x] T018 [P] [US2] Rebuild the Issue creation form with visible labels, repository selection, title/description/optional fields, server validation, pending submit state, and success/error feedback in `apps/web/src/features/issues/IssueCreatePage.tsx`.
- [x] T019 [P] [US2] Rebuild Issue detail header and metadata controls for title, state, assignee, labels, milestone, updated time, and original Gitea link in `apps/web/src/features/issues/IssueDetailHeader.tsx`.
- [x] T020 [P] [US2] Rebuild Issue edit controls with accessible field/error associations and close/reopen behavior in `apps/web/src/features/issues/IssueEditForm.tsx`.
- [x] T021 [P] [US2] Rebuild comment list and comment composer with empty, pending, error, and success feedback in `apps/web/src/features/issues/IssueComments.tsx` and `apps/web/src/features/issues/CommentComposer.tsx`.
- [x] T022 [US2] Integrate the new detail, edit, comments, and feedback presentation into `apps/web/src/features/issues/IssueDetailPage.tsx` and `apps/web/src/features/issues/IssueDetailRoute.tsx`; retain existing API calls where compatible and record any framework-first follow-up gap.
- [x] T023 [US2] Remove remaining obsolete Issue presentation code while keeping Gitea permission failures distinguishable from success; lifecycle parity is a follow-up unless the new component model already supports it cleanly.

**Checkpoint**: User Story 2 uses the new UI from `/issue/new` and `/issue/:owner/:repo/:number`.

---

## Phase 5: User Story 3 - 使用新版介面管理 Board 與 Kanban (Priority: P1)

**Goal**: Replace Board list/editor/repository picker/Kanban presentation with source-owned new components while preserving data boundaries.

**Independent Test**: Inspect a dummy cross-Repository Board and verify new columns, cards, fields, anomaly states, and pointer/keyboard interaction surfaces.

### Implementation for User Story 3

- [x] T024 [P] [US3] Rebuild Board list and Board editor page structure with accessible forms, Convention context, validation feedback, and responsive actions in `apps/web/src/features/boards/BoardListPage.tsx` and `apps/web/src/features/boards/BoardEditor.tsx`.
- [x] T025 [P] [US3] Rebuild the compatible Repository picker with explicit selected/available/incompatible states in `apps/web/src/features/boards/BoardEditor.tsx`; remove the unused standalone picker.
- [x] T026 [P] [US3] Rebuild Kanban card presentation showing Repository, Issue number, title, assignee, general Labels, direct Gitea link, and repair/error information while not repeating the Board Convention Workflow Label in `apps/web/src/features/boards/KanbanCard.tsx`.
- [x] T027 [P] [US3] Rebuild Kanban columns and empty/loading/error states in `apps/web/src/features/boards/KanbanColumn.tsx` and `apps/web/src/features/boards/KanbanBoard.tsx`.
- [x] T028 [US3] Integrate pointer drag/drop and keyboard card movement where the new framework supports it in `apps/web/src/features/boards/card-transition.ts`; do not retain obsolete interaction code solely for parity.
- [x] T029 [US3] Remove obsolete Board presentation code while keeping Board types and API/data boundaries intact; verify no Board JSON persistence, validation, version, atomic-write, flush, or locking code is changed.

**Checkpoint**: User Story 3 uses the new UI from `/boards` and `/boards/:id`.

---

## Phase 6: User Story 4 - 維護一致且可重用的介面元件 (Priority: P2)

**Goal**: Provide an isolated Storybook showcase for the shared UI and Portal-specific states used by Issues and Boards.

**Independent Test**: Start Storybook without Gitea and inspect normal, loading, empty, error, disabled, permission, long-content, focus, and responsive states.

### Implementation for User Story 4

- [x] T030 [P] [US4] Add Storybook stories for Button, Badge, Card, fields, Table, Dialog/Sheet, Alert, Skeleton, Checkbox, Separator, DropdownMenu, and layout primitives in `apps/web/src/components/ui/` and `apps/web/src/components/layout/`.
- [x] T031 [P] [US4] Add Storybook stories for Loading, Empty, Error, Permission denied, and mutation feedback states in `apps/web/src/components/feedback/Feedback.stories.tsx`.
- [x] T032 [P] [US4] Add Storybook stories for Issue row/card, Issue filters, labels, comments, Board card, and Kanban column states in `apps/web/src/features/issues/`, `apps/web/src/features/boards/`, and `apps/web/src/features/workflows/` where applicable.
- [x] T033 [US4] Configure Storybook global theme, viewport examples, and documentation for the Portal design tokens in `apps/web/.storybook/preview.tsx` and `apps/web/src/stories/DesignTokens.stories.tsx`.

**Checkpoint**: User Story 4 is independently reviewable through Storybook.

---

## Phase 7: User Story 5 - 在不同畫面尺寸與輔助操作下使用 Portal (Priority: P2)

**Goal**: Ensure the new Issue and Board UI is responsive, keyboard-operable, and explicit about focus, loading, error, and status feedback.

**Independent Test**: Use keyboard-only navigation and the Kanban keyboard alternative at 375/768/1024/1440 widths.

### Implementation for User Story 5

- [x] T034 [US5] Add responsive navigation, filter collapse/stacking, table-to-card fallback, detail layout, form layout, and Kanban overflow behavior in `apps/web/src/components/layout/`, `apps/web/src/features/issues/`, and `apps/web/src/features/boards/`.
- [x] T035 [US5] Add visible focus, semantic labels, live-region/alert announcements, dialog focus management, and reduced-motion behavior in `apps/web/src/index.css`, `apps/web/src/components/ui/`, and `apps/web/src/components/feedback/`.
- [x] T036 [US5] Add keyboard-equivalent Kanban destination selection and commit behavior in `apps/web/src/features/boards/KanbanCard.tsx`, `apps/web/src/features/boards/KanbanColumn.tsx`, and `apps/web/src/features/boards/card-transition.ts`.
- [x] T037 [US5] Verify long Repository names, Issue titles, Labels, Milestones, and Comments wrap or truncate safely without losing access to required actions in the affected Issue and Board components.

**Checkpoint**: User Story 5 is independently verifiable through keyboard and responsive scenarios.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Remove obsolete presentation code, verify the migration, and keep implementation/documentation aligned.

- [x] T038 [P] Remove obsolete custom presentation imports, unused selectors, and old style resources; update `apps/web/src/main.tsx` and remove `apps/web/src/styles.css` plus `apps/web/src/styles/accessibility.css`.
- [x] T039 [P] Audit all web-facing text, labels, focus names, error messages, and empty states for Traditional Chinese consistency and required Issue/Repository terminology in `apps/web/src/`.
- [x] T040 [P] Audit added dependency licenses and package lockfile entries against `apps/web/THIRD-PARTY-NOTICES.md` without adding credentials or generated runtime data.
- [x] T041 Run `pnpm.cmd typecheck` and resolve all frontend TypeScript errors across `apps/web/src/` and Storybook configuration.
- [x] T042 Run `pnpm.cmd build` and verify the production bundle builds for the existing monorepo packages without API/domain changes.
- [x] T043 Run targeted Prettier check, `git diff --check`, Storybook build, and the framework-first scenarios in `specs/004-frontend-ui-stack-migration/quickstart.md`; record accepted feature parity gaps as follow-up work.
- [x] T044 Update `specs/004-frontend-ui-stack-migration/plan.md`, `research.md`, `data-model.md`, `contracts/ui-api-preservation.md`, and `quickstart.md` after the framework-first decision, keeping the no-local-skill and presentation-only boundary explicit.

---

## Dependencies & Execution Order

- **Setup (Phase 1)** precedes Foundational.
- **Foundational (Phase 2)** blocks page migration because all pages consume its tokens, primitives, layout, and feedback states.
- **US1, US2, and US3** depend on Foundational and are independently deliverable.
- **US4** depends on primitives/fixtures and can proceed in parallel with page migration.
- **US5** hardens migrated flows before final validation.
- **Polish** follows all desired stories and removes only code proven unused.

### Parallel Opportunities

- T002–T005 after dependency selection.
- T008–T011 after T006/T007.
- T013–T015, T018–T021, and T024–T027 within their stories.
- T030–T032 after Storybook scaffolding.
- T038–T040 before T041–T043.

## Implementation Strategy

1. Install and configure the new stack.
2. Establish source-owned primitives, tokens, feedback, layout, and stories.
3. Replace Issue, Board, and Kanban presentation with the new framework.
4. Remove dead UI and related dead dependencies aggressively, while retaining API, auth, Source of Truth, and Board persistence boundaries.
5. Validate typecheck, production build, Storybook build, targeted format, and diff integrity.

## Notes

- `[P]` means the task can run in parallel when it touches different files and has no incomplete dependency.
- `[US#]` maps a task to a User Story for traceability.
- Initial framework migration is allowed to have feature parity gaps; do not retain obsolete UI to mask them.

---

## Phase 9: Convergence

- [x] T045 [P] Complete the source-owned Label primitive and replace the placeholder Sheet with an accessible open/close drawer primitive, including focus behavior, in `apps/web/src/components/ui/Label.tsx`, `apps/web/src/components/ui/Sheet.tsx`, and `apps/web/src/components/ui/Dialog.tsx` (FR-002, partial).
- [x] T046 [P] Add independent Storybook stories for `AppShell`, `PageHeader`, and `ResponsiveToolbar` in `apps/web/src/components/layout/*.stories.tsx` so core layout primitives have isolated showcase coverage (SC-005, partial).
- [x] T047 Remove the unused `IssueDetailRoute.tsx` wrapper after confirming no production or Storybook import remains, and update the feature file map if needed (T023, unrequested dead code).
