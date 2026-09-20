---

description: "Task list for Workflow Default State Repair"
---

# Tasks: Workflow Default State Repair

**Input**: Design documents from `specs/002-workflow-default-state-repair/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Testing**: Spec 沒有要求 TDD 或新增測試框架；本清單使用既有 `pnpm.cmd typecheck`、`pnpm.cmd build` 與 `quickstart.md` 的 Gitea dummy data 驗證。

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently after the foundational phase.

## Phase 1: Setup

**Purpose**: 確認本 feature 沿用既有 workspace、無新增 dependency，並準備實作入口。

- [X] T001 Confirm the existing TypeScript workspace entry points and scripts in `package.json`, `apps/api/package.json`, `apps/web/package.json`, `packages/domain/package.json`, and `packages/gitea-contracts/package.json`; do not add a database or new runtime dependency for this feature

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 建立所有 User Story 共用的 read-time repair annotation、default state 規則與 API/UI 型別。

**⚠️ CRITICAL**: User Story implementation cannot begin until this phase is complete.

- [X] T002 [P] Add the non-persisted `WorkflowRepair` annotation type and optional `workflowRepair` field to `IssueSummary` in `packages/domain/src/issue.ts` and export the type through `packages/domain/src/index.ts`; use exactly `outcome: "repaired" | "failed"`, `sourceState: "unconfigured" | "conflict"`, and the documented error codes `permission_denied | missing_label | concurrent_change | external_unavailable | persist_failed | unknown`
- [X] T003 Add a shared default-state selector and anomaly metadata helpers in `packages/domain/src/workflow-state-resolver.ts` and enforce the same rules at `apps/api/src/workflows/convention-loader.ts`; reject an empty state list, negative `order`, or duplicate `order`, and use the state with the minimum `order` as the only default without adding `defaultStateKey`
- [X] T004 Update `packages/gitea-contracts/src/portal.ts` and `apps/web/src/features/boards/types.ts` to carry the domain `workflowRepair` annotation while keeping Board JSON persistence unchanged and keeping empty normal Workflow columns distinct from omitted anomaly columns

**Checkpoint**: Shared types and default-state rules are available; no Board load or transition behavior has been changed yet.

---

## Phase 3: User Story 1 - 自動補上預設 Workflow 狀態 (Priority: P1) 🎯 MVP

**Goal**: Board load detects an Issue with no Workflow Label, writes the Convention default Label to Gitea, re-reads the Issue, and presents the repaired Card in the default column without changing Issue list/detail read-through behavior.

**Independent Test**: Prepare an Issue with ordinary Labels and no Board Convention Workflow Label, load the Board, verify the default Label exists in Gitea, ordinary Labels remain, the Card is in the minimum-`order` column, and list/detail reads do not mutate Labels.

### Implementation for User Story 1

- [X] T005 [US1] Implement Board-load-only anomaly repair for an Issue with no Convention Workflow Label in `apps/api/src/boards/board-view-service.ts`; use the current user's Repository Label permission, require the minimum-`order` target Label to already exist, preserve every non-Workflow Label, and never create a missing Label
- [X] T006 [US1] Make the no-label repair path in `apps/api/src/boards/board-view-service.ts` call `replaceIssueLabelsAtomically` with the read-time `updatedAt` and Label names, one atomic replacement, and post-write verification; reject concurrent changes and return current Gitea data instead of a Portal-only override
- [X] T007 [US1] Make the Board view service distinguish required Issue/Repository read failure from post-read repair failure in `apps/api/src/boards/board-view-service.ts` and `apps/api/src/boards/board-routes.ts`; return an overall external-service error when required data cannot be read, but await all per-Card repair attempts and return other successfully read Cards when only a repair write/verification fails
- [X] T008 [US1] Build Board columns after repair completion in `apps/api/src/boards/board-view-service.ts`; retain every Convention state column even when empty, omit `unconfigured` and `conflict` only when they have no Cards, and attach a successful `workflowRepair` annotation to Cards repaired during this load
- [X] T009 [P] [US1] Render the optional `workflowRepair` success/error metadata and conditional anomaly columns in `apps/web/src/features/boards/KanbanBoard.tsx`, `apps/web/src/features/boards/KanbanColumn.tsx`, and `apps/web/src/features/boards/KanbanCard.tsx` without adding any client-side Issue state or snapshot

**Checkpoint**: User Story 1 is independently usable and validates the default-state path end to end.

---

## Phase 4: User Story 2 - 修復 Workflow 狀態衝突 (Priority: P1)

**Goal**: Board load repairs an Issue containing multiple Workflow Labels from the selected Convention to the same minimum-`order` default, while leaving labels from other Conventions and all ordinary Labels untouched.

**Independent Test**: Prepare an Issue with two same-Convention Workflow Labels plus an ordinary Label, load the Board, verify exactly one default Convention Label remains in Gitea, the ordinary/other-Convention Labels remain, and the Card is not left in the conflict column after successful repair.

### Implementation for User Story 2

- [X] T010 [US2] Extend the repair branch in `apps/api/src/boards/board-view-service.ts` to treat two or more labels matching the selected Convention as `conflict`, replace only those matching labels with the minimum-`order` Label, and classify the Card from the verified Gitea response
- [X] T011 [US2] Preserve non-target metadata during conflict repair in `apps/api/src/boards/board-view-service.ts` and `apps/api/src/gitea/label-replacement.ts`; the replacement must keep all non-Workflow Labels and Labels belonging to other Workflow Conventions, and must use the existing version/label preflight, one replacement request, and post-write verification
- [X] T012 [US2] Ensure the conflict-column UI behavior in `apps/web/src/features/boards/KanbanBoard.tsx` and `apps/web/src/features/boards/KanbanColumn.tsx` reflects the API result: a successfully repaired conflict Card appears in the default column, while an only-failed conflict Card remains visible with its error annotation

**Checkpoint**: User Stories 1 and 2 both repair valid Gitea data without changing unrelated Labels.

---

## Phase 5: User Story 3 - 修復失敗時保留真實狀態 (Priority: P1)

**Goal**: Required Board data read failures return one overall external-service error; permission, missing-label, concurrent-change, persistence, or post-read Gitea repair failures never look like a successful repair; one failed Card does not block other successfully read Cards, and the user can still explicitly attempt a manual drag.

**Independent Test**: First use a user without Label permission, a Repository missing the default Label, or a concurrent update after Issue read; verify the affected Card has a readable per-card error while other successfully read Cards render. Then make required Issue/Repository reading unavailable and verify the whole Board returns an external-service error. Finally try a manual drag and verify success or unchanged failure state.

### Implementation for User Story 3

- [X] T013 [US3] Convert post-read automatic repair failures into per-Card `workflowRepair` failures in `apps/api/src/boards/board-view-service.ts`; map permission, missing Label, concurrent update, post-read external unavailability, and persistence verification failures to the documented error codes, preserve the original anomaly `workflowState`, and never fabricate the target state
- [X] T014 [US3] Make anomaly repair processing isolate post-read failures per Card in `apps/api/src/boards/board-view-service.ts`; complete and classify successful repairs even when other Cards fail, keep current Gitea data when a conflict is detected, return overall external-service errors for required Issue/Repository read failures, and make the next Board load retry from fresh Gitea data
- [X] T015 [US3] Allow an auto-repair-failed Card to be manually dragged to any valid state in `apps/api/src/boards/transition-service.ts`; remove only the unconditional conflict rejection, retain Repository membership and Label permission checks, require the target Label to exist, preserve non-Workflow Labels, and continue using `replaceIssueLabelsAtomically`
- [X] T016 [US3] Preserve manual transition truthfulness in `apps/api/src/boards/board-routes.ts` and `apps/api/src/boards/transition-service.ts`; return the re-read Gitea Issue on success, return actionable `403`/`409`/`422`/external-service errors on failure, and never return a successful target state when Gitea rejected or did not persist the replacement
- [X] T017 [P] [US3] Add visible repair-failure details and a Board reload/retry action in `apps/web/src/features/boards/KanbanBoard.tsx`, `apps/web/src/features/boards/KanbanCard.tsx`, and `apps/web/src/components/ErrorNotice.tsx`; failed Cards remain draggable, and failed manual transitions reload the actual Board view instead of retaining a client-only state

**Checkpoint**: All three P1 stories are independently functional; failures are visible and cannot corrupt the Gitea-backed state.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Align documentation, preserve existing read-through behavior, and run the feature validation gates.

- [X] T018 [P] Update `specs/002-workflow-default-state-repair/contracts/board-workflow-repair.md` and `specs/002-workflow-default-state-repair/data-model.md` after implementation; keep the documented whole-Board read failure versus per-Card repair failure boundary, `workflowRepair` read-time boundary, and no-new-persistence rule exact
- [X] T019 [P] Verify Issue list/detail code paths in `apps/api/src/issues/issue-search-service.ts`, `apps/api/src/issues/issue-service.ts`, `apps/api/src/issues/issue-routes.ts`, and `apps/api/src/boards/board-view-service.ts` so automatic repair is reachable only from Board load
- [X] T020 Run `pnpm.cmd typecheck` for `packages/domain`, `packages/gitea-contracts`, `apps/api`, and `apps/web`, including `apps/api/src/workflows/convention-loader.ts`, resolving type errors without introducing a new test or persistence dependency
- [X] T021 Run `pnpm.cmd build` from the repository root using the script in `package.json`, and verify generated output is not added to source control unless the repository already tracks it
- [X] T022 Execute every scenario in `specs/002-workflow-default-state-repair/quickstart.md` against dummy Gitea data, including success, conflict, post-read permission/missing-label/concurrent-change failure, required-data read failure, manual drag, hidden anomaly columns, retained empty normal columns, list/detail non-mutation, and the 3-second load-to-visible-result check

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: T001 can start immediately.
- **Phase 2 Foundational**: T002-T004 depend on T001 and block all story work.
- **Phase 3 US1**: T005-T009 depend on T002-T004; this is the MVP increment.
- **Phase 4 US2**: T010-T012 depend on the shared repair path from T005-T008 and can then be completed independently.
- **Phase 5 US3**: T013-T017 depend on the repair result shape and Board load path from T002-T009; T015-T017 also depend on the existing transition endpoint.
- **Phase 6 Polish**: T018-T022 depend on the desired story implementation; T020 and T021 can run after code changes, while T022 requires the built/runnable portal and dummy Gitea data.

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational. This is the MVP.
- **US2 (P1)**: Depends on the US1 repair pipeline because conflict repair uses the same Board-load replacement path; it does not depend on US3 failure UI.
- **US3 (P1)**: Depends on the shared repair/contract path from US1 and the conflict path from US2 for complete anomaly coverage; manual transition work can be implemented in parallel with the final failure annotation work once T002-T004 are complete.

### Parallel Opportunities

- T002 and T003 can be developed in parallel because they touch separate domain concerns; T004 follows T002 for contract type reuse.
- T009 can be developed in parallel with the API-only portions of US1 after T004.
- T011 and T012 can be developed in parallel after T010 if the API response shape is stable.
- T017 can be developed in parallel with T013-T016 once the `workflowRepair` contract is fixed.
- T018 and T019 can be reviewed in parallel; T020 and T021 are independent validation commands after implementation.

## Parallel Example: User Story 1

```text
After T002-T004:

Task: T005/T006 - Implement no-Workflow-Label repair with atomic replacement in apps/api/src/boards/board-view-service.ts
Task: T009 - Render workflowRepair and conditional columns in apps/web/src/features/boards/
```

## Parallel Example: User Story 3

```text
After T002-T004 and the API shape is fixed:

Task: T013/T014 - Implement per-card post-read failure handling and whole-Board read errors in apps/api/src/boards/board-view-service.ts
Task: T015/T016 - Implement manual anomaly transition behavior in apps/api/src/boards/transition-service.ts and board-routes.ts
Task: T017 - Implement failure/retry UI in apps/web/src/features/boards/
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001-T004.
2. Complete T005-T009.
3. Run the default-state and read-through scenarios from `specs/002-workflow-default-state-repair/quickstart.md`.
4. Stop and validate that Gitea contains the default Label and no ordinary Labels were lost.

### Incremental Delivery

1. Deliver US1: no-label default repair and conditional columns.
2. Deliver US2: same-Convention conflict repair and unrelated-label preservation.
3. Deliver US3: truthful failure annotations, partial failure isolation, and manual anomaly drag.
4. Run T018-T022 before considering the feature complete.

## Notes

- Every implementation task has a checkbox, sequential ID, required story label where applicable, and concrete file path.
- `[P]` is used only where tasks can work on separate files or independent validation surfaces without waiting on unfinished dependencies.
- No automated test tasks are included because the feature spec did not request TDD or a test framework; T020-T022 are the required existing build/manual validation gates.
