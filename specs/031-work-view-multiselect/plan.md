# Implementation Plan: 工作檢視多選篩選

**Branch**: `031-work-view-multiselect` | **Date**: 2026-10-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification at `specs/031-work-view-multiselect/spec.md`

## Summary

Extend the existing shared List/Kanban/Gantt filter model from single values to selected value sets for Status, Priority, and Issue Type. Each category matches any selected value, while different categories compose with AND. The unfinished shortcut replaces the current Status selection with exactly Todo and In Progress. Persist selections in the existing view URLs and apply the same semantics to Issue List reads and client-filtered Kanban/Gantt data.

## Technical Context

**Language/Version**: TypeScript 5.8.2, React 19, Node.js 22

**Primary Dependencies**: Existing pnpm workspace, Fastify 5.2, React, react-i18next 17, Storybook

**Storage**: Browser URL query state only; no Issue or filter persistence is added.

**Testing**: Storybook interaction-ready stories; required `pnpm.cmd typecheck`, `pnpm.cmd build`, and web Storybook build. No new automated test suite is requested by the specification.

**Target Platform**: Authenticated desktop and responsive web UI

**Project Type**: pnpm workspace web application (`apps/web`, `apps/api`, shared packages)

**Performance Goals**: Filter changes update visible results immediately; no additional repository or Issue reads are introduced beyond the existing List and aggregate-view loads.

**Constraints**: Gitea remains the only Issue source of truth. Use existing delegated access and workspace scope. Do not mutate Gitea data, add persistence, or weaken complete-result/error behavior. Preserve Gantt and List URL-specific state.

**Scale/Scope**: Three shared work views, four Priority values, three Issue Types, three fixed Statuses, existing assignee filter, and zh-TW/en/ja.

## Constitution Check

| Principle | Gate | Plan result |
|---|---|---|
| I. Gitea is the Issue source of truth | No Issue mirror or persisted Issue/filter snapshot | PASS; only URL query state is used. |
| II. Use current user permissions | All reads remain delegated and workspace-scoped | PASS; no API access scope changes. |
| III. Safe Gitea writes | No new Gitea write behavior | PASS; feature is read-only. |
| IV. Complete aggregate results | Required repository failures remain whole-view errors | PASS; filters apply to complete loaded data. |
| V. Fixed Issue Status | Use Todo/In Progress/Done semantics and keep anomalies visible when Status is unfiltered | PASS; status values are not changed. |
| VI. Clear work scope | Shared filters remain within the selected workspace | PASS. |
| VII. Multilingual user text | All new visible/accessibility strings localized in zh-TW/en/ja | PASS. |
| Additional: shared contracts | Keep API/web query types aligned | PASS; only filter query multiplicity changes. |

No constitution exceptions are required.

## Design Decisions

1. Represent Priority, Issue Type, and Status as arrays of valid selected values. An empty array means that category is unfiltered; Assignee remains the existing single value.
2. Within each selected category, match an Issue when its single normalized value is included in that category's selected values. AND together non-empty categories and existing Assignee behavior. When Status is unfiltered, preserve current anomaly behavior; when any explicit Status is selected, anomalies do not match.
3. Serialize each selected value as a repeated query parameter (`priority=high&priority=low`). Parse all repeated values, retain valid unique values in canonical option order, and ignore invalid values without dropping valid siblings. This is backward-compatible with existing single-value URLs.
4. Keep an “All” control in each choice group; activating it clears that category. Individual options toggle independently. The “Unfinished” shortcut sets Status to exactly `todo` and `in-progress`; its selected state is derived from those two options both being selected. It is not a separate status or query value.
5. Render removable applied-filter chips per selected value. Clearing a chip removes only that value; removing the final value returns that category to the unfiltered state. Clear-all continues to preserve the existing default assignee behavior.
6. Issue List sends repeated values to `/api/issues`; the API parses repeated query values and filters the complete read-through Issue set before sorting/response. Kanban and Gantt use the same shared matcher on their existing complete datasets. No Gitea API parameters, persistence, or write paths are introduced.
7. Preserve repeated filter values during List/Kanban/Gantt URL navigation and sanitize each value independently. Each filter change creates a browser history entry; listen for `popstate` to restore the matching selection and reload List results. Keep existing view-specific query keys and same-view sort behavior.
8. Add deterministic Storybook scenarios for shortcut selection/reset, individual toggling, multiple Priority and Type choices, URL restoration/invalid values, and combined filters. Localize labels and accessible names in all three supported languages.

## Project Structure

### Documentation

```text
specs/031-work-view-multiselect/
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   └── work-view-multiselect.md
├── quickstart.md
└── tasks.md
```

### Source Code

```text
apps/web/src/features/work-views/work-view-filters.ts         # Selected sets, URL parse/serialize, shared predicate
apps/web/src/features/work-views/WorkViewFilterBar.tsx         # Toggle groups, unfinished shortcut, applied chips
apps/web/src/features/work-views/work-view-url-state.ts       # Preserve and sanitize repeated values across views
apps/web/src/features/issues/issue-list-state.ts              # List query serialization and chip removal flow
apps/web/src/lib/api.ts                                        # Repeated query parameter request encoding
apps/api/src/issues/issue-routes.ts                            # Parse repeated query values
apps/api/src/issues/issue-search-service.ts                    # OR within category, AND across categories
apps/api/src/gitea/client.ts                                   # Shared query value types
apps/web/src/i18n/resources/work-views.ts                      # Unfinished text in zh-TW/en/ja
apps/web/src/features/work-views/WorkViewFilterBar.stories.tsx # Filter behavior scenarios
apps/web/src/index.css                                         # Selection, focus, responsive layout
```

**Structure Decision**: Extend the current work-view filter module, shared control panel, List read path, URL helpers, and localized Storybook coverage. No new package or service is needed.

## Phase 0: Research

See [research.md](research.md). Existing List search loads authorized repository Issues completely and filters before returning results. Kanban and Gantt already apply the shared matcher to complete loaded data. URL helpers use `URLSearchParams`, so repeated query keys can represent each selected value without adding a new encoding scheme. The user confirmed that each filter change must create a browser history entry and back/forward must restore that exact filter state.

## Phase 1: Design & Contracts

- [Data model](data-model.md) describes set-valued filters and empty-set semantics.
- [Filter contract](contracts/work-view-multiselect.md) defines query multiplicity and matching behavior across API and views.
- [Quickstart](quickstart.md) defines Storybook and required workspace validation scenarios.

## Complexity Tracking

No constitution violations; no package, persistence, or external service complexity is introduced.
