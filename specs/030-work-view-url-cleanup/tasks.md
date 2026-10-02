---
description: "Task list for view-aware work-view URL state"
---

# Tasks: 工作檢視網址參數範圍

**Input**: Design documents from `specs/030-work-view-url-cleanup/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/work-view-url-state.md`, `quickstart.md`

**Tests**: No automated tests were requested; acceptance scenarios are recorded in `quickstart.md`.

## Phase 1: Setup

No new dependencies or project setup are required.

## Phase 2: Foundational

**Purpose**: Define one reusable route-aware policy before updating navigation surfaces.

- [X] T001 Add typed work-view URL helpers for shared filters, Gantt-only keys, List sort keys, retired keys, and source/target filtering in `apps/web/src/features/work-views/work-view-url-state.ts`.

**Checkpoint**: Every navigation surface can use the same state selection and cleanup rules.

## Phase 3: User Story 1 - 切換檢視時網址只保留適用狀態 (Priority: P1) 🎯 MVP

**Goal**: View and workspace navigation produce clean destination URLs while preserving applicable shared filters and List sorting.

**Independent Test**: Run quickstart scenarios 1–3 and 6 for List, Kanban, Gantt, All repos, and Repository workspaces.

- [X] T002 [US1] Apply the shared URL policy to sidebar view links and clicks in `apps/web/src/components/layout/AppShell.tsx`, preserving workspace scope, shared filters, Gantt state only for Gantt-to-Gantt navigation, and List sorting only for List-to-List navigation.
- [X] T003 [US1] Apply the same policy to All repos and Repository selection in `apps/web/src/components/layout/WorkspaceSelector.tsx`; carry Gantt date/scale only for Gantt source and destination, and List sort/direction only for List source and destination.
- [X] T004 [US1] Clean view-inapplicable and retired query keys when List or Kanban shared filters update, retaining valid Gantt state only on Gantt and List sort state only on List in `apps/web/src/features/issues/issue-list-state.ts`, `apps/web/src/features/work-views/KanbanBoard.tsx`, and `apps/web/src/features/work-views/work-view-filters.ts`.
- [X] T005 [US1] Ensure Gantt URL synchronization and Issue detail return URL construction retain valid shared filters and Gantt date/scale while removing retired Gantt keys in `apps/web/src/features/work-views/GanttBoard.tsx`.

**Checkpoint**: Sidebar navigation, workspace selection, and filter updates obey the same query policy.

## Phase 4: User Story 2 - 從 Issue 返回時還原原本 Gantt (Priority: P2)

**Goal**: Issue detail and create flows return to the exact originating view state without leaking Gantt state from other views.

**Independent Test**: Run quickstart scenarios 4–5 for Gantt, List, and Kanban origins.

- [X] T006 [US2] Preserve and normalize origin-appropriate state in Issue detail/create return targets: Gantt date/scale for Gantt, List sort/direction for List, and shared filters for all work views, across `apps/web/src/app/routes.ts`, `apps/web/src/components/layout/AppShell.tsx`, `apps/web/src/features/issues/IssueListPage.tsx`, `apps/web/src/features/work-views/KanbanBoard.tsx`, `apps/web/src/features/work-views/GanttBoard.tsx`, `apps/web/src/features/issues/IssueDetailPage.tsx`, and `apps/web/src/features/issues/IssueCreatePage.tsx`.

**Checkpoint**: Returning from Issue detail or creation restores only state that belongs to its originating view.

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Execute end-to-end acceptance coverage and required workspace validation.

- [X] T007 Update `specs/030-work-view-url-cleanup/quickstart.md` if implementation reveals route behavior that differs from the contract, then execute all manual URL scenarios and record outcomes in that file.
- [X] T008 Run `pnpm.cmd typecheck` and `pnpm.cmd build`; resolve any failures in the owning source files.

## Dependencies & Execution Order

### Phase Dependencies

- Setup has no work; Foundational T001 must complete before view integrations.
- User Story 1 tasks T002–T005 depend on T001 and execute serially where they touch the same policy or files.
- User Story 2 T006 depends on the URL policy and navigation integration from T001–T005.
- Polish T007–T008 depends on both user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after T001; independently delivers clean view/workspace URLs and shared-filter/List-sort preservation.
- **US2 (P2)**: Starts after T001 and integrates with US1 URL policy; delivers exact Issue return restoration.

### Parallel Opportunities

- No source tasks are marked parallel because they share the URL policy or navigation files.
- Manual verification preparation may run alongside implementation; final scenarios depend on both user stories.

## Implementation Strategy

1. Implement T001 and complete User Story 1 as the MVP.
2. Implement User Story 2 without changing return behavior for unaffected routes.
3. Run the full manual quickstart and required typecheck/build validation.

## Notes

- All tasks include checkbox, sequential ID, required story label, and exact file paths for implementation work.
- Gitea data, APIs, user permissions, and Issue persistence are outside this feature.

## Phase 6: Convergence

- [X] T009 Run the authenticated browser scenarios in `specs/030-work-view-url-cleanup/quickstart.md` across List, Kanban, Gantt, Issue detail, Issue creation, and workspace switching, then record the runtime results in that file per SC-001–SC-005.
