# Implementation Plan: 最近完成項目篩選與完整 Issue List

**Branch**: `025-recent-done-visibility` | **Date**: 2026-10-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/025-recent-done-visibility/spec.md`

## Summary

Expose Gitea's completion timestamp throughout the existing Issue read model, then apply a transient, default-on 30-local-calendar-day filter to Done items in Issues List, Kanban, and Gantt. Change the Issue List read path to return every matching Issue in one response and remove page navigation; keep its existing sorting and filter behavior. No Portal or Gitea persistence is added.

## Technical Context

**Language/Version**: TypeScript, Node.js 22

**Primary Dependencies**: Existing pnpm workspace, Fastify API, React/Vite Web, shared `@gitea-portal/domain` and `@gitea-portal/gitea-contracts`

**Storage**: Gitea remains the sole source for Issue data; the new view toggle is in-memory page state only

**Testing**: No new automated test suite requested; validate with the repository-required `pnpm.cmd typecheck` and `pnpm.cmd build`, plus the manual scenarios in `quickstart.md`

**Target Platform**: Existing authenticated browser client and Portal API

**Project Type**: pnpm monorepo web application

**Performance Goals**: No new numeric latency target; the Issue List must return and render the complete filtered result set without page navigation

**Constraints**: Preserve per-user Gitea authorization and whole-request failure behavior; use Gitea `closed_at`, never `updated_at`, as completion time; all new user-visible text must be localized in zh-TW, en, and ja

**Scale/Scope**: All repos and single Repository workspaces; Issues List, Kanban, and Gantt; two user stories

## Constitution Check

| Principle | Status | Evidence / constraint |
|-----------|--------|-----------------------|
| I. Gitea is the sole Issue source | PASS | Read `closed_at` from Gitea; no Issue mirror or persistence |
| II. Follow current user permissions | PASS | Reuse the delegated Gitea client and existing repository access scope |
| III. Safe Gitea writes | PASS | This feature performs no Gitea writes |
| IV. Aggregate results are complete or fail | PASS | Preserve all-pages reads and fail the request if a required read fails |
| V. Fixed Issue Status semantics | PASS | Apply date filtering only when resolved Portal Status is `done` |
| VI. Clear work scope | PASS | Preserve repository identity in All repos and existing workspace boundaries |
| VII. Localized accessible UI | PASS | Add localized checkbox labels and accessible state in all supported locales |

No constitution violations identified.

## Project Structure

### Documentation (this feature)

```text
specs/025-recent-done-visibility/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── issues-list-unpaginated.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/domain/src/issue.ts
packages/gitea-contracts/src/gitea.ts
packages/gitea-contracts/src/portal.ts
apps/api/src/gitea/client.ts
apps/api/src/issues/issue-service.ts
apps/api/src/issues/issue-search-service.ts
apps/web/src/lib/api.ts
apps/web/src/features/issues/IssueListPage.tsx
apps/web/src/features/issues/issue-list-state.ts
apps/web/src/features/work-views/WorkViewFilterBar.tsx
apps/web/src/features/work-views/work-view-filters.ts
apps/web/src/features/work-views/KanbanBoard.tsx
apps/web/src/features/work-views/GanttBoard.tsx
apps/web/src/i18n/resources/issues.ts
apps/web/src/i18n/resources/work-views.ts
```

**Structure Decision**: Extend the existing shared Issue contract and read-through mapper, keep the recent-Done predicate in the shared Web work-view filter module, and integrate the transient control with the existing shared filter bar. The API's issue search already reads all Gitea pages and currently slices the aggregate to a 50-item page; return the full match set and remove the Web pagination controls while preserving sort and other filters.

## Design Decisions

- Carry nullable Gitea `closed_at` through Gitea contract, domain summary, API response, and Web Issue type. A missing timestamp never qualifies for recent Done, but remains visible when the toggle is off.
- Keep the recent-Done toggle separate from URL-backed shared filters and persisted preferences. Each work-view page starts checked; reload or navigation remounts it checked.
- Apply the predicate after the existing filters and only to issues whose resolved Portal Status is `done`; other statuses and anomalies pass through unchanged.
- Return the complete Issue List result set from the API with the current sort applied. Remove page/has-next UI state and page controls; existing URLs with a `page` value are treated as the same full list.
- Keep the Gitea all-pages read-through and existing fail-whole-request behavior for required reads; do not introduce partial lists or a Portal cache.

## Implementation Phases

1. **Shared completion data**: Add `closedAt` to the Gitea/domain/API/Web issue shapes.
2. **User Story 1 — completion visibility**: Add the localized accessible checkbox and shared predicate; apply recent-only and all-Done behavior to List, Kanban, and Gantt in both workspace scopes; update the upper-left result count and completion-condition summary, and reset the temporary value on reload/navigation.
3. **User Story 2 — complete Issue List**: Return the full sorted matching result set and remove Issue List pagination while preserving filters and sorting.
4. **Polish**: Update representative Storybook fixtures/states and docs; run required typecheck/build and walk through quickstart scenarios.

## Complexity Tracking

No constitution exceptions or additional services are required.
