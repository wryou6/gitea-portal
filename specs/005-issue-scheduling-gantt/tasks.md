# Tasks: Issue 排程日期與甘特圖

**Input**: Design documents from `specs/005-issue-scheduling-gantt/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: No dedicated test runner exists and the specification does not explicitly request test-authoring tasks. Validate via `pnpm.cmd typecheck`, `pnpm.cmd build`, and the manual scenarios in `quickstart.md`.

**Organization**: Tasks are grouped by user story. US1 and US2 are P1; US3 is P2.

## Phase 1: Setup

**Purpose**: Feature uses the current workspace and dependencies; no project initialization is needed.

- [x] T001 [P] Update the feature scope and validation instructions in `README.md` to include Issue scheduling dates and Board Gantt.

---

## Phase 2: Foundational

**Purpose**: Define schedule types and date parsing shared by Issue mutations, read APIs, and Board Gantt.

- [x] T002 [P] Add nullable `startDate` and `dueDate` plus schedule anomaly/status types to `packages/domain/src/issue.ts` and export them through `packages/domain/src/index.ts`.
- [x] T003 Add Gitea `due_date` mapping in `apps/api/src/gitea/client.ts` and strict calendar-date/start-date-label parsing in `packages/domain/src/issue-schedule.ts` and `apps/api/src/issues/issue-service.ts`.
- [x] T004 [P] Add the normalized schedule fields to Gitea and Portal response contracts in `packages/gitea-contracts/src/gitea.ts` and `packages/gitea-contracts/src/portal.ts`.

**Checkpoint**: Shared Issue responses can represent source dates and invalid schedule state without Portal persistence.

---

## Phase 3: User Story 1 - 為 Issue 設定排程日期 (Priority: P1) 🎯 MVP

**Goal**: Create/edit/read start date and due date through Gitea while preserving permissions and Labels.

**Independent Test**: Set, clear, reload, and verify both date values in Portal and Gitea; reject unauthorized or concurrent Label updates and show actual persisted values.

### Implementation for User Story 1

- [x] T005 Add validation for optional `startDate` and `dueDate` ISO calendar-date values, PATCH omission semantics, and explicit-null clearing in `apps/api/src/issues/issue-validation.ts`.
- [x] T006 Implement paginated lookup and permission-scoped create/reuse for `start-date:YYYY-MM-DD` Repository Label definitions, retain unused definitions, and update Issue label assignments using optimistic concurrency while preserving Workflow/general labels in `apps/api/src/issues/issue-schedule-service.ts` and `apps/api/src/gitea/client.ts`.
- [x] T007 Integrate schedule writes into Issue create/update flows; date fields own the reserved start-date Label, generic Labels edits preserve it, reject stale edit forms using Gitea `updatedAt`, map due date to Gitea native `due_date`, re-read after partial failures, and return actual saved values in `apps/api/src/issues/issue-command-service.ts` and `apps/api/src/issues/issue-routes.ts`.
- [x] T008 [P] Add labeled date inputs and save/clear behavior to `apps/web/src/features/issues/IssueCreatePage.tsx` and `apps/web/src/features/issues/IssueEditForm.tsx`.
- [x] T009 [P] Display normalized start and due dates on Issue list and detail in `apps/web/src/features/issues/IssueListPage.tsx` and `apps/web/src/features/issues/IssueDetailHeader.tsx`.

**Checkpoint**: Issue date edits round-trip to Gitea and current-user authorization, atomic Label replacement, and actual save outcomes are visible.

---

## Phase 4: User Story 2 - 在 Board 甘特圖檢視排程 (Priority: P1)

**Goal**: Add a Board Gantt view with complete repository-scoped schedules, anomalies, single-day items, and unscheduled Issues.

**Independent Test**: Switch an existing multi-Repository Board to Gantt and verify all Issue pages, full identity, date rendering, anomaly handling, unscheduled section, and all-or-error loading.

### Implementation for User Story 2

- [x] T010 Add the `BoardGanttView` response type with Board metadata and normalized Issue schedule rows in `packages/domain/src/board.ts` and `packages/gitea-contracts/src/portal.ts`.
- [x] T011 [P] Implement a Board-scoped Gantt read service that fetches every `state=all` Issue page from each configured Repository and fails the response on any required page error in `apps/api/src/boards/gantt-service.ts`.
- [x] T012 Register `GET /api/boards/:id/gantt` with Board lookup, exact Convention validation, and delegated read permissions in `apps/api/src/boards/board-routes.ts`.
- [x] T013 [P] Add separate Kanban/Gantt URLs, navigation links, and Gantt data loading/error states to `apps/web/src/app/App.tsx`, `apps/web/src/features/boards/BoardListPage.tsx`, `apps/web/src/features/boards/KanbanBoard.tsx`, and `apps/web/src/features/boards/types.ts`.
- [x] T014 Implement semantic Gantt rows and date-axis range/single-day rendering, Issue detail links, anomalies, and the `未排程` section in `apps/web/src/features/boards/GanttBoard.tsx`.
- [x] T015 Add responsive timeline styling and a keyboard-readable narrow-screen Issue/date list in `apps/web/src/index.css` and `apps/web/src/features/boards/GanttBoard.tsx`.

**Checkpoint**: Gantt includes every configured Board Issue and never presents a partial fetch as a complete schedule.

---

## Phase 5: User Story 3 - 篩選負責人與 Issue 狀態 (Priority: P2)

**Goal**: Let users filter Gantt rows by assignee and Open/Closed state with the current user as the default assignee.

**Independent Test**: Verify initial current-user results, switching to another assignee/all assignees, and Open/Closed filters without changing Gitea Issues.

### Implementation for User Story 3

- [x] T016 Add current-user default from the existing `/api/session` response, assignee choices, and Open/Closed filters to `apps/web/src/features/boards/GanttBoard.tsx` using the Board's fully loaded Gantt Issue set.

**Checkpoint**: Filter combinations only change visible rows; Issue state and assignments remain unchanged.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the integrated feature and update durable operating documentation.

- [x] T017 Run serial workspace `typecheck` and `build` from repository root (`pnpm.cmd -r --workspace-concurrency=1 typecheck` and `pnpm.cmd -r --workspace-concurrency=1 build`) and resolve errors in modified files.
- [ ] T018 Execute the applicable manual acceptance scenarios from `specs/005-issue-scheduling-gantt/quickstart.md` against a configured Gitea instance.

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup T001 can run independently.
- Foundational T002-T004 block all story implementation because issue schedule fields are shared.
- US1 (T005-T009) and US2 (T010-T015) are both P1, but US2 depends on the shared schedule contract and parser from Phase 2; the Board Gantt can then read schedules without depending on the Issue date editor.
- US3 (T016) depends on US2's Gantt UI and data loading.
- Polish tasks depend on the desired stories being complete.

### Parallel Opportunities

- T001 can run in parallel with shared-contract work. T002 and T004 can run in parallel because they update different packages; T003 follows T002 because it consumes shared date types.
- After T002-T004, US1 and US2 can be implemented in parallel by separate owners, subject to the user-confirmed start-date Label policy.
- In US1, T008 and T009 touch separate UI files and can run in parallel with API tasks T005-T007.
- In US2, T011-T012 API work can proceed in parallel with T013-T015 UI scaffolding after the response contract T010 is agreed.
- T017 and T018 are sequential validation gates after implementation.

## Implementation Strategy

### MVP First

1. Complete setup and shared schedule contracts.
2. Complete US1 so date values persist to and reload from Gitea.
3. Validate the Issue date flow independently.
4. Complete US2 to expose schedule data in the Board Gantt.
5. Complete US3 filters and run cross-cutting validation.

### Incremental Delivery

Deliver US1 date entry/read first, then US2 Board Gantt with date and unscheduled/anomaly states, then US3 filters. Keep each increment read-through from Gitea; do not introduce Issue persistence in the Board store.

## Notes

- Each task uses a checkbox, sequential ID, optional `[P]`, story label for user story tasks, and at least one exact file path.
- The start-date Label format and lifecycle are confirmed in `spec.md`: `start-date:YYYY-MM-DD`, create/reuse with the current user's permission, and retain unused Repository definitions.
- No test-writing task is included because neither the feature specification nor the user requested a test-first workflow; use typecheck/build and the quickstart manual checks.
- T018 remains unchecked until the outstanding manual scenarios below can be exercised with suitable test accounts and a safely disposable high-volume fixture.

## Phase 7: Convergence

- [ ] T019 Execute the remaining Gitea manual acceptance scenarios in `specs/005-issue-scheduling-gantt/quickstart.md` against an authorized disposable test Repository and record the outcome for T018 (partial).

### Manual acceptance record (2026-09-26)

- Passed: quickstart scenarios 1, 2, 4, 5, 7, and 8 on `admin/portal-test-web` and Board `跨 Repo 驗證 Board v3`. Verified create/edit/reload for both dates, independent clearing, retained unused date-label definitions, stale-form 409 with the concurrent Gitea Label preserved, both/single/no-date and malformed/duplicate/reversed schedules, assignee/state filters without Issue-state writes, and the 375 px keyboard-readable list.
- Not run: scenario 3 requires a separate account without Gitea write permission; only the authorized admin session was available. Scenario 6 requires more than 100 Board Issues plus a controllable later-page failure; no safely disposable high-volume fixture or page-failure injection was available.
- Test Issue `admin/portal-test-web#5` is restored to start-only (`2026-09-28`) with its original Issue Labels. The due-only fixture `#6` remains in the dummy Repository. Repository date-label definitions are retained by design, including the malformed/duplicate anomaly fixtures created for this check.
