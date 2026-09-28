---
description: "Issues table and Status terminology/migration implementation tasks"
---

# Tasks: Issues 表格與 Status 統一

**Input**: Design documents from `specs/018-issues-table/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: No separate automated test tasks were requested. Storybook stories are a required product deliverable; implementation validation includes the project-required typecheck/build.

## Phase 1: Setup

**Purpose**: Confirm implementation boundaries and preserve the current Gitea permission and label replacement conventions.

- [X] T001 Record the current `/api/issues` and Status label integration points in `specs/018-issues-table/quickstart.md`, including existing all-pages repository aggregation and Gitea label replacement behavior.
- [X] T002 Implement the clarified prefix precedence: retain existing `status:`/`status-action:` labels and remove corresponding legacy-prefix labels in `apps/api/src/issues/status-label-migration-service.ts`.

## Phase 2: Foundational

**Purpose**: Add the source Issue fields and shared domain/API types needed by the table and Status features.

- [X] T003 [P] Map Gitea `created_at` and Issue `user` into `GiteaIssue` in `packages/gitea-contracts/src/gitea.ts` and `apps/api/src/gitea/client.ts`; preserve the native ISO timestamp and author login/full name without fallback inference.
- [X] T004 [P] Add `createdAt` and `author` to the shared Issue summary in `packages/domain/src/issue.ts` and Portal response contract in `packages/gitea-contracts/src/portal.ts`.
- [X] T005 Define shared sortable column and direction types plus stable Status naming in `packages/domain/src/issue.ts`, `packages/domain/src/index.ts`, and `packages/gitea-contracts/src/portal.ts`.

**Checkpoint**: Source Issue fields and shared contracts compile before the user stories are integrated.

## Phase 3: User Story 1 - 掃描與辨識 Issues (Priority: P1)

**Goal**: Replace issue cards with a 10-column accessible table in All repos and Repository views.

**Independent Test**: Storybook fixture rows show Type, Key, Title, Assignee, Status, Priority, Created at, Start Date, Due Date, and Author in order; Key opens the correct Issue; missing/anomaly values stay explicit.

### Implementation for User Story 1

- [X] T006 [P] [US1] Add sortable table header, cell, row, overflow, and focus styles in `apps/web/src/index.css`, reusing the semantic table structure from `apps/web/src/components/ui/Table.tsx`.
- [X] T007 [US1] Replace card mapping with the specified 10-column table in `apps/web/src/features/issues/IssueListPage.tsx` and `apps/web/src/features/issues/IssueRow.tsx`, retaining create/detail return URLs and repository-specific views.
- [X] T008 [US1] Render `owner/repo#number` as the stable Key and add Author/Created at presenters in `apps/web/src/features/issues/IssueRow.tsx` using the shared Issue contract.
- [X] T009 [P] [US1] Add translated table headings, column accessibility labels, empty/loading/error text, and author/date labels for all supported locales in `apps/web/src/i18n/resources/issues.ts`.
- [X] T010 [US1] Add representative table stories for All repos, single Repository, missing/anomaly data, and long values in `apps/web/src/features/issues/IssueListPage.stories.tsx`.

**Checkpoint**: Both Issues surfaces render the same accessible table and preserve Issue navigation.

## Phase 4: User Story 2 - 依欄位排序與瀏覽 (Priority: P1)

**Goal**: Sort complete filtered results by any column, default to Key ascending, preserve view state in URL, and cap pages at 50 Issues.

**Independent Test**: Query more than 50 Issues, sort each whitelisted field both ways, verify deterministic ties/null placement, reload/share URL, and navigate pages without duplicates caused by page-local sorting.

### Implementation for User Story 2

- [X] T011 [US2] Validate allowed sort fields/directions and normalize page/limit bounds in `apps/api/src/issues/issue-routes.ts` and `apps/api/src/issues/issue-search-service.ts`.
- [X] T012 [US2] Implement semantic field comparators, null-last ordering, deterministic Key tie-breaker, and sorting before page slicing in `apps/api/src/issues/issue-search-service.ts`.
- [X] T013 [US2] Return canonical `sort` and `direction` with the Issue page contract in `packages/gitea-contracts/src/portal.ts` and `apps/api/src/issues/issue-search-service.ts`.
- [X] T014 [US2] Extend client query serialization and Issue page types for sort/direction in `apps/web/src/lib/api.ts`.
- [X] T015 [US2] Store sort, direction, filters, and page together in URL-backed list state; default to Key ascending, toggle current direction, reset page on filter/sort changes in `apps/web/src/features/issues/issue-list-state.ts` and `apps/web/src/features/issues/IssueListPage.tsx`.
- [X] T016 [US2] Add keyboard-operable sort buttons, `aria-sort`, direction indicators, and translated sort labels in `apps/web/src/features/issues/IssueListPage.tsx` and `apps/web/src/i18n/resources/issues.ts`.
- [X] T017 [US2] Enforce the 50-row maximum in the client query and API, and synchronize previous/next navigation with query URL state in the search service and client list state.
- [X] T018 [US2] Add Storybook examples for default Key ascending and alternate field/direction in `apps/web/src/features/issues/IssueListPage.stories.tsx`.

**Checkpoint**: All sort/filter operations apply before pagination; every page is at most 50 items and URL state restores the same view.

## Phase 5: User Story 3 - 辨認逾期排程 (Priority: P2)

**Goal**: Emphasize only overdue Due Date text and fire icon for open Issues.

**Independent Test**: Compare yesterday, today, future, closed, unset, and invalid Due Date cases; only an open Issue with date earlier than local today has the date-level marker.

### Implementation for User Story 3

- [X] T019 [US3] Add local-calendar-day overdue predicate using `dueDate` and native Gitea state in `apps/web/src/features/issues/IssueRow.tsx`.
- [X] T020 [US3] Render an accessible fire icon and overdue color only on the Due Date value in `apps/web/src/features/issues/IssueRow.tsx` and `apps/web/src/index.css`; keep the table row styling unchanged.
- [X] T021 [P] [US3] Add translated overdue accessible text for every locale in `apps/web/src/i18n/resources/issues.ts`.
- [X] T022 [US3] Add Storybook cases for overdue, today, future, closed, missing, and anomalous dates in `apps/web/src/features/issues/IssueListPage.stories.tsx`.

**Checkpoint**: Overdue emphasis is restricted to the date value and does not change the rest of the row.

## Phase 6: User Story 4 - 檢視一致的頁面設計 (Priority: P2)

**Goal**: Make the table's primary data and interaction states reviewable in Storybook without Gitea.

**Independent Test**: Storybook displays normal/sorted/overdue/anomaly/empty/loading/error states and supports narrow viewport horizontal scrolling.

### Implementation for User Story 4

- [X] T023 [US4] Provide deterministic translated fixtures with createdAt, author, Status, and schedule edge cases in `apps/web/src/stories/fixtures.ts` and `apps/web/src/features/issues/IssueListPage.stories.tsx`.
- [X] T024 [US4] Add empty, loading, and read-error table stories without live API requests in `apps/web/src/features/issues/IssueListPage.stories.tsx`.
- [X] T025 [US4] Document how to open and review Issues table stories in `apps/web/src/stories/README.md` and `specs/018-issues-table/quickstart.md`.

**Checkpoint**: All requested visual states are reproducible in Storybook at normal and narrow widths.

## Phase 7: User Story 5 - 在各檢視使用一致的 Status 語意 (Priority: P1)

**Goal**: Rename all current product concepts and contracts to Status, migrate existing Gitea state/action labels, and only remove legacy compatibility after full-scope verification.

**Independent Test**: A complete authorized migration run preserves unrelated Issue data, reports every failure/conflict, resumes safely, verifies the full agreed scope, then allows a build with no live legacy term/prefix references.

### Implementation for User Story 5

- [X] T026 [P] [US5] Rename fixed state/action definitions and resolver files, types, and exported names to Status while preserving three-state Gitea semantics in `packages/domain/src/status.ts`, `packages/domain/src/issue-status-resolver.ts`, `packages/domain/src/issue.ts`, `packages/domain/src/work-view.ts`, and `packages/domain/src/index.ts`.
- [X] T027 [P] [US5] Rename API transitions, definitions, routes, view service, and error messages to Status terms in `apps/api/src/issues/`, `apps/api/src/http/`, `apps/api/src/work-views/`, `apps/api/src/repositories/`, and `apps/api/src/app.ts`; expose the Status definition endpoint.
- [X] T028 [US5] Rename web Issue properties, dialogs, presenters, translations, CSS classes, fixtures, and Kanban/Gantt consumers to Status naming in `apps/web/src/lib/api.ts`, `apps/web/src/features/`, `apps/web/src/i18n/`, `apps/web/src/index.css`, and `apps/web/src/stories/`.
- [X] T029 [US5] Replace stale Status documentation in README, AGENTS, and Constitution; fixed Status definitions live in domain source and no `config/workflows/` or `config/status/` directory exists.
- [X] T030 [US5] Update Status reads, filters, validation, schedule replacement, and Kanban label hiding to prefer new prefixes while retaining legacy compatibility until verified migration in API/domain code.
- [X] T031 [US5] Implement the admin-authorized, bounded-concurrency, rerunnable migration service that enumerates the full scope, maps exact known labels, preserves unrelated labels, reports old/new value resolutions, and uses per-Issue optimistic atomic replacement plus read-back verification.
- [X] T032 [US5] Add an admin-only Portal management entry point, session permission checks, retry/result reporting, and complete-scope verification contract in the migration route, app registration, settings page, and Portal contract.
- [X] T033 [US5] Keep legacy-prefix reads active while migration is incomplete and ensure all new writes emit only the new prefix.
- [X] T034 [US5] Add translated migration progress, failed Issue, conflict, retry, and full-verification messages for every locale in `apps/web/src/i18n/resources/settings.ts` and `SettingsPage.tsx`.
- [ ] T035 [US5] Remove all legacy-prefix compatibility code and remaining current-product terminology only after complete-scope verification succeeds; scan active source/config/docs and update `specs/018-issues-table/quickstart.md` with the evidence and release order.

**Checkpoint**: The agreed entire target set is read and verified with no old prefixes before compatibility is removed; no new writes recreate legacy values.

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Finish repository-wide consistency and perform required validation.

- [X] T036 Update the completed design, endpoint, migration, Status, and acceptance details across this feature's artifacts.
- [X] T037 Search maintained product code, UI resources, README, AGENTS, and Constitution; only explicit legacy-prefix compatibility/migration code remains until verified migration.
- [X] T038 Run `pnpm.cmd typecheck` and `pnpm.cmd build` from repository root and record outcomes in `specs/018-issues-table/quickstart.md`.
- [X] T039 Run the Web Storybook build and inspect Issues table normal, narrow, overdue, loading, empty, and error stories; record outcomes in `specs/018-issues-table/quickstart.md`.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup**: T001 and clarified T002 are complete.
- **Foundational**: Depends on setup; blocks table integration and API sort contract tasks.
- **US1**: Depends on T003–T005 for the complete Issue row contract.
- **US2**: Depends on T003–T005; can begin independently of visual US1 work, then integrates sorting controls into the table.
- **US3**: Depends on the US1 Due Date column.
- **US4**: Depends on US1 table and US3 overdue presenter.
- **US5**: Naming and model tasks can proceed after clarification; label migration/cutover tasks depend on the answered scope, trigger, and completion proof in T002. Final compatibility removal T035 depends on verified migration completion.
- **Polish**: Depends on all selected story work.

### User Story Dependencies

- **US1 (P1)**: Foundation only.
- **US2 (P1)**: Foundation; table controls integrate with US1.
- **US3 (P2)**: US1 Due Date column.
- **US4 (P2)**: US1 and US3.
- **US5 (P1)**: Naming and model tasks are complete; compatibility removal T035 depends on successful admin execution and complete-scope verification.

### Parallel Opportunities

- T003 and T004 can proceed in separate contracts/client files after data mapping is agreed.
- In US1, T006 and T009 can proceed in parallel; T010 follows the row contract.
- In US2, T011/T012 are API work and T014/T015 are client URL-state work; integrate header controls after both contracts settle.
- In US3, translation T021 can proceed with predicate/styling implementation.
- US1 table work and the non-migration portion of US5 Status rename can proceed in parallel only after the foundational contracts are stable.

## Parallel Example: User Story 1

```text
T006 table primitives and styles in apps/web/src/index.css
T009 translated column and accessibility names in apps/web/src/i18n/resources/issues.ts
```

## Implementation Strategy

### MVP First

1. Complete T001–T005.
2. Deliver US1 table and US2 complete-result sorting/pagination.
3. Deliver US3 overdue value and US4 Storybook review cases.
4. Perform the verified live Status-label migration through the admin Portal entry point before T035 removes legacy compatibility.

### Incremental Delivery

Keep the new Status reader able to read both prefixes while migrating. Do not perform T035 compatibility removal until the admin migration has completed and the full-scope verification report is successful. Repeat migration and full-scope verification until every target Issue passes, then ship the final build that drops legacy reads and names.

## Notes

- Every task has an ID and concrete file path; `[P]` is limited to independent file work.
- Migration writes are per Issue, not a global transaction; partial progress must remain explicit and resumable.
- Old feature specs are historical artifacts and are excluded from the post-migration active terminology scan.
- T031–T034 implement the clarified admin migration flow. Execute the live migration before T035 removes legacy compatibility.

## Phase 9: Convergence

**Purpose**: Close implementation gaps found by comparing the current codebase with FR-023 and SC-007.

- [X] T040 Return and render a per-Issue successful migration outcome (migrated or unchanged), alongside existing per-Issue conflicts and failures, in `apps/api/src/issues/status-label-migration-service.ts`, `packages/gitea-contracts/src/portal.ts`, `apps/web/src/lib/api.ts`, and `apps/web/src/features/settings/SettingsPage.tsx` (FR-023, partial).
- [ ] T041 Run the complete Status-label migration through the Portal as Gitea `admin`, resolve every reported failure/conflict according to the clarified new-label-wins rule, and record a `verified: true` full-scope report in `specs/018-issues-table/quickstart.md` before completing T035 (SC-007, partial).
- [X] T042 Align localized Issues table headings and Status terminology in `apps/web/src/i18n/resources/issues.ts` and `apps/web/src/i18n/resources/work-views.ts` with the Gitea UI terminology; validate the affected UI resources (FR-001, FR-015).
