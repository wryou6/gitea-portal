---
description: "Implementation tasks for Portal multilingual interface"
---

# Tasks: Portal 中英日語系

**Input**: Design documents from `specs/014-multilingual-interface/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: No automated test tasks; the feature spec does not request a test-first workflow. Run the repository-required typecheck/build and the manual quickstart scenarios in the final phase.

## Phase 1: Setup

**Purpose**: Add the selected i18n runtime dependency.

- [X] T001 Add `i18next` and `react-i18next` to `apps/web/package.json` and update `pnpm-lock.yaml`.

---

## Phase 2: Foundational

**Purpose**: Provide locale identifiers, typed static resources, and the shared translator required by every story.

- [X] T002 Create supported locale resolution and the typed i18next singleton in `apps/web/src/i18n/locales.ts` and `apps/web/src/i18n/index.ts`, with namespace resource modules under `apps/web/src/i18n/resources/`.
- [X] T003 Record Gitea release, locale catalog keys, and Portal-only terminology provenance in `apps/web/src/i18n/terminology.md`.

**Checkpoint**: Shared locale runtime and terminology source map are ready.

---

## Phase 3: User Story 1 - 選擇並保留介面語系 (Priority: P1) 🎯 MVP

**Goal**: Resolve the initial locale before render, switch immediately in settings, and persist a choice per Portal login.

**Independent Test**: Select different locales for two logins in one browser, reload and switch logins, and verify each locale is restored; clear one preference and verify browser-language fallback.

### Implementation

- [X] T004 [US1] Implement browser-language resolution, account-keyed localStorage persistence, and storage-failure fallback in `apps/web/src/features/settings/locale-preference.ts`.
- [X] T005 [US1] Resolve the authenticated login locale before React mount in `apps/web/src/main.tsx`, initialize the i18n runtime, and synchronize document `lang` in `apps/web/src/app/App.tsx`.
- [X] T006 [US1] Add the accessible language selector and immediate locale switching to `apps/web/src/features/settings/SettingsPage.tsx`, with translated labels in `apps/web/src/i18n/resources/settings.ts`.

**Checkpoint**: Locale selection, account isolation, reload restoration, and browser fallback work independently of the localized feature surfaces.

---

## Phase 4: User Story 2 - 以所選語系操作 Portal (Priority: P1)

**Goal**: Localize Portal-owned navigation, issue and board workflows, fixed vocabulary, accessibility copy, and formatting while preserving source values.

**Independent Test**: Visit issue list/detail/create/edit/comments, workspace selection, Board/Kanban/Gantt, and settings in all three locales; verify Portal-owned copy and fixed terms switch consistently while Gitea content and stable identifiers remain unchanged.

### Implementation

- [X] T007 [P] [US2] Localize application navigation, shared page chrome, workspace selection, and repository workspace messages in `apps/web/src/components/layout/AppShell.tsx`, `apps/web/src/components/layout/WorkspaceSelector.tsx`, `apps/web/src/features/repositories/RepositoryWorkspacePage.tsx`, and `apps/web/src/i18n/resources/common.ts`.
- [X] T008 [P] [US2] Localize issue list/detail/create/edit/filter/comment forms, validation, and accessibility copy in `apps/web/src/features/issues/` and `apps/web/src/i18n/resources/issues.ts`.
- [X] T009 [P] [US2] Localize Board list/editor/issues, Kanban, Gantt, empty/loading states, and accessibility copy in `apps/web/src/features/boards/` and `apps/web/src/i18n/resources/boards.ts`.
- [X] T010 [P] [US2] Localize shared loading, empty, permission-denied, and general feedback components in `apps/web/src/components/feedback/` and `apps/web/src/i18n/resources/feedback.ts`.
- [X] T011 [US2] Replace hardcoded Issue Type, Priority, fixed workflow state, transition reason, and next-action display text with locale keys; add stable `nextActionKey` through `packages/domain/src/workflow.ts`, `packages/domain/src/issue.ts`, `apps/api/src/issues/issue-service.ts`, `apps/web/src/lib/api.ts`, and the relevant issue/board components.
- [X] T012 [US2] Format dates, timestamps, counts, and pluralized copy with `Intl` using the active locale while preserving date-only calendar values in `apps/web/src/features/issues/IssueComments.tsx`, `apps/web/src/features/issues/IssueDetailHeader.tsx`, `apps/web/src/features/issues/IssueRow.tsx`, `apps/web/src/features/issues/ScheduleDates.tsx`, and `apps/web/src/features/boards/GanttBoard.tsx`.

**Checkpoint**: All Portal-owned primary surfaces display the selected locale, and all Gitea-backed content and workflow values remain unchanged.

---

## Phase 5: User Story 3 - 保留 Gitea 內容與來源錯誤細節 (Priority: P2)

**Goal**: Return stable Portal error codes for localized summaries while retaining existing status, compatibility message, and raw Gitea details.

**Independent Test**: Trigger Portal validation/auth/not-found errors and an upstream Gitea error in each locale; verify localized Portal summaries, stable codes, and unchanged upstream detail.

### Implementation

- [X] T013 [US3] Define shared Portal API error code, parameter, and response types and export them from `packages/domain/src/api-error.ts` and `packages/domain/src/index.ts`.
- [X] T014 [US3] Emit stable codes and optional interpolation parameters from Portal errors while preserving HTTP status and the legacy `error` field in `apps/api/src/errors.ts`, `apps/api/src/http/error-handler.ts`, and API route/service error call sites under `apps/api/src/`.
- [X] T015 [US3] Parse typed error code, parameters, and raw upstream detail without discarding compatibility fields in `apps/web/src/lib/api.ts`.
- [X] T016 [US3] Translate known error summaries and render raw upstream detail separately in `apps/web/src/components/feedback/ErrorNotice.tsx` and `apps/web/src/i18n/resources/api-errors.ts`.

**Checkpoint**: Portal error summaries follow the selected locale; upstream Gitea content remains visible in its original language.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Close translation gaps and verify the complete feature against the design artifacts.

- [X] T017 Review user-visible strings and locale-key parity across `apps/web/src/`, then complete terminology provenance in `apps/web/src/i18n/terminology.md`.
- [X] T018 Run `pnpm.cmd typecheck`, `pnpm.cmd build`, and the manual scenarios in `specs/014-multilingual-interface/quickstart.md`; record results and resolve any feature regressions.
    - Root typecheck/build passed. Authenticated manual results, the two translation fixes and the protected-label edit fix are recorded in `quickstart.md`.

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) precedes Foundational (Phase 2).
- Foundational (Phase 2) blocks all user stories.
- User Story 1 and User Story 2 are both P1; US2 requires the locale runtime established in Phase 2. US2 localization can proceed after Phase 2, while the selector integration in US1 may be completed independently.
- User Story 3 depends on shared domain/API types in its own phase and can follow the UI localization work.
- Polish depends on all three stories.

### User Story Dependencies

- US1 depends on the locale runtime in Phase 2 and is the minimal MVP for choosing and persisting locale.
- US2 depends on the locale runtime in Phase 2; fixed workflow display additionally updates shared domain/API/Web contracts.
- US3 depends on the shared error response type and API/Web consumers within US3; it does not alter Gitea source data.

### Parallel Opportunities

- T002 and T003 touch separate files and can proceed in parallel after T001.
- After Phase 2, T007, T008, T009, and T010 use distinct feature surfaces and namespace resource files and can proceed in parallel.
- US1 settings work can proceed alongside US2 feature-surface localization after Phase 2, subject to integration before final verification.

## Parallel Example: User Story 2

```text
Task: T007 shared navigation and repository workspace copy
Task: T008 issue surfaces and issue resources
Task: T009 board surfaces and board resources
Task: T010 shared feedback components and feedback resources
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Complete US1 and verify locale selection, account-scoped persistence, and browser fallback.
3. US2 is also P1 and required for the product to provide a usable multilingual interface; continue through all primary Portal surfaces before considering the feature complete.
4. Complete US3 so localized Portal errors preserve Gitea diagnostics.
5. Run the typecheck, production build, and quickstart scenarios.

### Notes

- Every task has a sequential ID and an explicit path.
- `[P]` is used only for tasks with separate files and no incomplete-task dependency.
- No task changes Gitea user content, labels, workflow identifiers, permissions, or persistence.

## Phase 7: Convergence

- [X] T019 Run authenticated end-to-end locale, account-preference, source-data-preservation, and localized-error scenarios from `quickstart.md` against an available API/Gitea instance; record results and resolve surfaced implementation gaps per SC-001, SC-002, SC-003, and SC-005.
    - Authenticated Portal/Gitea checks passed; account switching used a mocked session identity for the second locale key. Error summaries/details and source-data fingerprints are recorded in `quickstart.md`.
