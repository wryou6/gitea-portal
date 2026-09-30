description: "Implementation tasks for the global sidebar Issue creation entry"
---

# Tasks: 側邊導覽建立問題入口

**Input**: Design documents from `specs/021-sidebar-issue-creation/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/sidebar-issue-creation.md`

**Tests**: No dedicated automated tests were requested. Validate behavior with the feature quickstart and run the repository-required typecheck/build.

## Phase 1: Setup

**Purpose**: No project initialization or dependency changes are needed.

## Phase 2: Foundational

**Purpose**: No shared infrastructure or data model changes are needed.

## Phase 3: User Story 1 - 從左側導覽建立問題 (Priority: P1)

**Goal**: Provide one accessible global sidebar entry to the existing Issue create flow, preserve Repository selection context, and remove the duplicate Issues page title action.

**Independent Test**: Follow `quickstart.md` through All repos and Repository views, collapsed/keyboard sidebar operation, and localized labels; confirm the Issues title area no longer has the create action.

### Implementation

- [X] T001 [US1] Add the localized global navigation label for Traditional Chinese, English, and Japanese in `apps/web/src/i18n/resources/common.ts`.
- [X] T002 [US1] Add the create navigation item, plus icon, context-aware destination, and create-route active state in `apps/web/src/components/layout/AppShell.tsx` using `apps/web/src/app/routes.ts`.
- [X] T003 [US1] Remove the Issues page title create action and update its layout composition in `apps/web/src/features/issues/IssueListPage.tsx` and `apps/web/src/components/layout/Layout.stories.tsx`.
- [X] T004 [US1] Validate the All repos, Repository, collapsed-sidebar, keyboard, and locale scenarios in `specs/021-sidebar-issue-creation/quickstart.md`.
- [X] T006 [US1] Distinguish the Issues list navigation label from the create action in all three supported locales and update the UI contract.

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Verify repository-wide UI quality gates.

- [X] T005 Run `pnpm.cmd typecheck` and `pnpm.cmd build` from the repository root and resolve any failures caused by this feature.

## Dependencies & Execution Order

### Phase Dependencies

- Setup and Foundational phases require no work for this feature.
- User Story 1 can start immediately; T001 precedes T002 because the shell consumes the localized label.
- T003 can be implemented independently of T001/T002. T004 follows the UI changes. T005 follows all implementation and scenario validation.

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories; it is the complete MVP.

### Parallel Opportunities

- T003 may run in parallel with T001 and T002 because it changes separate files.
- T002 follows T001; T004 and T005 are validation steps after implementation.

## Implementation Strategy

### MVP First

Complete T001-T004 to deliver and independently validate the single P1 story, then complete T005 for project quality gates.

## Notes

- Task IDs are sequential; `[US1]` maps to the sole user story in `spec.md`.
- No API, domain, Gitea contract, or persistence changes are in scope.
