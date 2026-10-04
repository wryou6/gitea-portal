# Implementation Plan: 工作檢視篩選列版面

**Branch**: `035-work-view-filter-layout` | **Date**: 2026-10-04 | **Spec**: [spec.md](spec.md)

## Summary

在既有共用工作檢視版面中加入主要內容上方的篩選區，三種工作檢視桌面版共用同一行，依序排列負責人、狀態、優先級及類型。篩選值、查詢結果、網址狀態及摘要維持既有行為；近期已完成開關與各檢視工具仍由現有控制區承載。使用現有輕量視覺 token、分隔及間距，不建立大型外框或底色面板；窄版依可用寬度換行。

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (existing Web workspace)

**Primary Dependencies**: Existing React Router, react-i18next, shared WorkViewFilters and badge components; no new dependency.

**Storage**: N/A; filters continue using existing URL state and current session-level view-control state.

**Testing**: `pnpm.cmd typecheck`, `pnpm.cmd build`; review existing Storybook stories and responsive/localized views. No new automated test suite is requested by the specification.

**Target Platform**: Existing supported desktop and narrow web viewports; Traditional Chinese, English, Japanese.

**Project Type**: Existing pnpm web application within a multi-package workspace.

**Performance Goals**: No added data fetching or filter computation; visual rearrangement must not delay existing result updates.

**Constraints**: Preserve filter semantics, URL/history behavior, accessibility, translation coverage, recent-done control, and view-specific tools. Do not add Issue persistence or API changes.

**Scale/Scope**: Three work views (List, Kanban, Gantt), in All repos and single-Repository workspaces.

## Constitution Check

**Pre-design gate: PASS**

- No Issue data, persistence, Gitea API, permission, or status semantics change; Principles I–VI remain unaffected.
- Visible controls, accessible labels, and responsive layout must use all supported translations per Principle VII.
- Plan includes `typecheck` and production build validation required by Development Process.
- Feature maintains its Spec Kit artifacts; scope is limited to Web presentation.

## Project Structure

### Documentation (this feature)

```text
specs/035-work-view-filter-layout/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/web/src/
├── features/issues/IssueListPage.tsx
├── features/work-views/
│   ├── WorkViewLayout.tsx
│   ├── WorkViewFilterBar.tsx
│   ├── KanbanBoard.tsx
│   ├── GanttBoard.tsx
│   └── WorkViewFilterBar.stories.tsx
├── i18n/resources/
└── index.css
```

**Structure Decision**: Reuse the current shared work-view layout and filter component across List, Kanban, and Gantt. Give the top filter region and existing control region distinct content slots, so the four common filters render above the result summary while recent-done and view-specific controls remain in their current region. Keep all present URL/filter state ownership in the current page/view components.

## Design Decisions

- Render the common filter controls in a shared top region owned by `WorkViewLayout`; keep page-specific controls in the existing sidebar slot.
- Keep the common controls in one compact desktop row ordered assignee/status/priority/type. Place each status/priority/type label inline to the left of its options, keep each choice group on a single line at desktop widths, and allow wrapping at narrower widths while preserving order. Keep clear-filter and active-filter chips with the common controls.
- Extract the recent-done checkbox from the shared common filter group so it can remain in the existing control region without duplicating state.
- Use CSS layout and existing theme tokens only. Rows may wrap at narrow widths; no fixed viewport-specific pixel assumptions beyond the spec's desktop acceptance width.
- Keep the existing filter change callbacks, parsing/serialization and `WorkViewFilters` shape unchanged.
- Add no external contract: this is a presentation-only change.

## Constitution Check (Post-design)

**Post-design gate: PASS**

- Layout-only interface separation does not change the data source or delegated Gitea permissions.
- Existing Todo/In Progress/Done meanings and anomaly behavior remain intact.
- Translation and accessibility work is limited to preserving existing labels and semantics while checking the moved controls in all locales.
- Validation covers workspace typecheck/build and visual review of desktop/narrow layouts.

## Complexity Tracking

No constitution exceptions or new packages.
