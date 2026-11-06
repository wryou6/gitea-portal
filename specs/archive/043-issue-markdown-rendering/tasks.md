# Tasks: Issue Markdown Rendering

**Input**: Design documents from `specs/043-issue-markdown-rendering/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: No automated test suite was requested. Run the repository-required typecheck/build and validate the acceptance scenarios from `quickstart.md`.

**Organization**: Tasks are grouped by the feature's independently testable user story.

## Phase 1: Setup

**Purpose**: Add the Markdown renderer dependencies to the existing Web app.

- [x] T001 Add `react-markdown` and `remark-gfm` dependencies in `apps/web/package.json` and update `pnpm-lock.yaml`.

---

## Phase 2: User Story 1 - Read Issue description and comments (Priority: P1) 🎯 MVP

**Goal**: Render Markdown consistently in the Issue description and each comment in both full-page and dialog presentations.

**Independent Test**: Open an Issue with Markdown in its description and comments in both presentations; verify CommonMark/GFM structure, safe links, raw HTML handling, empty content, and narrow-screen overflow behavior.

### Implementation for User Story 1

- [x] T002 [US1] Create a shared `MarkdownContent` renderer using `react-markdown` and `remark-gfm` in `apps/web/src/features/issues/MarkdownContent.tsx`; keep raw HTML disabled and retain safe URL handling.
- [x] T003 [US1] Render the Issue description and comment bodies through `MarkdownContent` in `apps/web/src/features/issues/IssueDetailPage.tsx` and `apps/web/src/features/issues/IssueComments.tsx`.
- [x] T004 [US1] Add readable Markdown typography and contained code/table overflow styles in `apps/web/src/index.css`.
- [x] T005 [US1] Run `pnpm.cmd typecheck` and `pnpm.cmd build`, then validate the description, comments, safety, empty-content, and narrow-screen scenarios in `specs/043-issue-markdown-rendering/quickstart.md`.

**Checkpoint**: The description and all comments render consistently and safely in both Issue presentations.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; must finish before renderer implementation.
- **User Story 1 (Phase 2)**: Depends on Phase 1. Complete T002 before wiring T003; finish T004 before final layout validation in T005.

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on another story; this is the complete MVP.

### Parallel Opportunities

- T004 can be implemented independently after T001 while T002 is being built; T003 depends on T002.

## Implementation Strategy

### MVP First

1. Add dependencies (T001).
2. Build the shared renderer and integrate it in the description and comments (T002-T003).
3. Style and validate the feature (T004-T005).

## Notes

- No API, domain, Gitea contract, persistence, or translation changes are required.
- `[P]` is omitted because the tasks have a simple sequential dependency and do not need separate parallel execution.

## Phase 3: Convergence

- [x] T006 Restore the pre-existing `devDependencies` ordering in `apps/web/package.json` per plan: dependency scope (unrequested).
