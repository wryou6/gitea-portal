# Tasks: Priority 統一與跨頁呈現

**Input**: Design documents from `specs/012-priority-presentation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/issue-priority-api.md, quickstart.md

**Tests**: Repository has no test runner and the spec does not request a new automated test framework. Validate using typecheck/build, Storybook, and the manual Gitea scenarios in `specs/012-priority-presentation/quickstart.md`.

## Phase 1: Setup

**Purpose**: Reuse the existing workspace and Storybook configuration; no dependency or project initialization changes are required.

- No setup changes required.

---

## Phase 2: Foundational

**Purpose**: Define Priority in the shared domain and make it available through every existing Issue response before implementing form or display stories.

- [X] T001 [P] Define `IssuePriority`, canonical label names, localized display names, resolver, and status in `packages/domain/src/issue-priority.ts`; export it from `packages/domain/src/index.ts`.
- [X] T002 Extend `IssueSummary` with nullable `priority` in `packages/domain/src/issue.ts`; confirm `packages/gitea-contracts/src/portal.ts` exposes it through its existing `IssueSummary` contract.
- [X] T003 Derive `priority` from live Gitea Labels in `apps/api/src/issues/issue-service.ts` and expose it through the frontend `Issue` type in `apps/web/src/lib/api.ts`.

**Checkpoint**: Existing Issue responses expose a nullable Priority derived from Labels without an extra Label request or Portal persistence.

---

## Phase 3: User Story 1 - 為 Issue 指定標準 Priority (Priority: P1) 🎯 MVP

**Goal**: Create/edit require one of four values and write the matching Repository-scoped Label to Gitea while preserving other Labels.

**Independent Test**: Follow create, update, invalid-value, and label-preservation scenarios in `specs/012-priority-presentation/quickstart.md`.

### Implementation

- [X] T004 [US1] Validate required `priority` and reject invalid values or generic Labels beginning with `priority:` in `apps/api/src/issues/issue-validation.ts`.
- [X] T005 [US1] Ensure the selected Repository Priority Label exists during create and include its Label ID in `apps/api/src/issues/issue-command-service.ts` and `apps/api/src/issues/issue-schedule-service.ts`.
- [X] T006 [US1] Include Priority in the existing complete atomic Label replacement, preserving Type, Workflow, schedule, and requested ordinary Labels with optimistic concurrency/readback checks in `apps/api/src/issues/issue-schedule-service.ts`.
- [X] T007 [P] [US1] Add the accessible four-level selector with missing/conflict repair status in `apps/web/src/features/issues/PriorityField.tsx`.
- [X] T008 [P] [US1] Add Priority selection and request payload handling to `apps/web/src/features/issues/IssueCreatePage.tsx`.
- [X] T009 [P] [US1] Initialize and submit Priority, and exclude reserved Priority Labels from the ordinary-label input in `apps/web/src/features/issues/IssueEditForm.tsx`.

**Checkpoint**: Create and edit persist exactly one canonical Priority Label; missing/conflicting existing Issues can be repaired, and failures remain visible.

---

## Phase 4: User Story 2 - 在工作頁面快速辨識 Priority (Priority: P1)

**Goal**: Use one accessible visual treatment across Issue list/detail, Kanban, and Gantt, reviewed through Storybook in both themes.

**Independent Test**: Follow Storybook and cross-page scenarios in `specs/012-priority-presentation/quickstart.md` using valid, missing, conflicting, and unknown Priority Labels.

### Implementation

- [X] T010 [US2] Create a shared Priority badge for the four levels and missing/conflict states using semantic theme tokens in `apps/web/src/components/ui/PriorityBadge.tsx` and `apps/web/src/index.css`.
- [X] T011 [P] [US2] Render Priority in Issue rows and details and omit reserved Priority Labels from duplicate generic-label presentation in `apps/web/src/features/issues/IssueRow.tsx`, `apps/web/src/features/issues/IssueDetailHeader.tsx`, and `apps/web/src/features/issues/issueLabelPresentation.ts`.
- [X] T012 [P] [US2] Render Priority in Kanban cards while preserving Board-visible label behavior in `apps/web/src/features/boards/KanbanCard.tsx`.
- [X] T013 [P] [US2] Render Priority in scheduled, unscheduled, and anomaly Gantt rows in `apps/web/src/features/boards/GanttIssueRow.tsx`.
- [X] T014 [P] [US2] Add fictional Storybook fixtures for all four Priority values plus missing, multiple, and unknown labels in `apps/web/src/stories/fixtures.ts`.
- [X] T015 [P] [US2] Add Storybook coverage for Priority badge levels and anomalous states in `apps/web/src/components/ui/PriorityBadge.stories.tsx`.
- [X] T016 [P] [US2] Add Storybook coverage for the Priority field in `apps/web/src/features/issues/PriorityField.stories.tsx`.
- [X] T017 [P] [US2] Extend Issue row and detail stories with Priority variants in `apps/web/src/features/issues/IssueRow.stories.tsx` and `apps/web/src/features/issues/IssueDetailHeader.stories.tsx`.
- [X] T018 [P] [US2] Extend Kanban and Gantt stories with Priority variants in `apps/web/src/features/boards/KanbanCard.stories.tsx` and `apps/web/src/features/boards/GanttIssueRow.stories.tsx`.

**Checkpoint**: All four Priority levels and anomalous states remain identifiable and consistent across the four work views, forms, and Storybook light/dark themes.

---

## Phase 5: Polish & Cross-Cutting Validation

**Purpose**: Validate contract, build, accessibility, and manual Gitea behavior across both stories.

- [X] T019 Run `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd --filter @gitea-portal/web build-storybook`; resolve any failures in the affected source/story files.
- [X] T020 Review keyboard-native selection, text-based Priority meaning, light/dark token pairs, and wrapping behavior in `apps/web/src/components/ui/PriorityBadge.stories.tsx` and `apps/web/src/features/issues/PriorityField.stories.tsx`.
- [ ] T021 Run the Gitea scenarios in `specs/012-priority-presentation/quickstart.md` against a designated non-production test Repository and record results in that file.

**Pending validation**: The target dummy Repository is designated and Gitea-side write/read scenarios were exercised. Portal-authenticated create/edit, optimistic concurrency, permission-failure, and page-view checks remain pending because the unauthenticated local Portal API returned HTTP 401.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No changes required; workspace and Storybook already exist.
- **Foundational (Phase 2)**: T001 → T002 → T003; blocks both user stories because they consume the shared Priority model and Issue response.
- **User Stories (Phases 3–4)**: Both depend on Phase 2 and can then be developed in parallel; API write-path tasks T004–T006 are sequential, while form tasks T007–T009 use distinct files.
- **Polish (Phase 5)**: Depends on both user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Starts after foundational tasks; independently delivers selection and Gitea persistence.
- **US2 (P1)**: Starts after foundational tasks; independently delivers consistent display and Storybook review using fixture data.

### Parallel Opportunities

- T001 can run parallel with no-op setup verification; T002 and T003 follow in dependency order.
- After Phase 2, US1 and US2 may proceed in parallel in separate API/form and presentation files.
- Within US2, T011, T012, and T013 can run in parallel after T010. T014 can run before them; stories T015–T018 follow their respective components and fixture types.

## Parallel Example: User Story 2

```text
Task: T011 render Priority on Issue list/detail
Task: T012 render Priority on Kanban cards
Task: T013 render Priority on Gantt rows
```

## Implementation Strategy

### MVP First

1. Complete shared domain and Issue response tasks T001–T003.
2. Complete User Story 1 tasks T004–T009 to enforce and persist Priority.
3. Validate create/edit and label preservation using the Gitea scenarios in quickstart.md.

### Incremental Delivery

1. Add User Story 2 shared presentation component and page integration.
2. Add Storybook fixtures/stories for all supported and anomalous states.
3. Complete typecheck, production build, Storybook build, accessibility review, and full quickstart validation.

### Format Validation

Every actionable task uses a checkbox, sequential task ID, required story label for story phases, and explicit repository file path. No automated test tasks are listed because no test runner exists and none was requested.

---

## Phase 6: Convergence

- [X] T022 Designate and document the non-production Gitea Repository and Issue/Label write access required to unblock T021 in `specs/012-priority-presentation/quickstart.md` per SC-001 and SC-005 (partial)
