# Research: 工作檢視篩選列版面

## Decision: Keep filter state ownership in the current work-view pages

**Rationale**: List, Kanban, and Gantt already supply the same filter model and callbacks to a shared `WorkViewFilterBar`. URL parsing, history behavior, and cross-view portability are implemented outside visual layout. Moving the rendered controls does not require changing that state model.

**Alternatives considered**: Duplicating filter controls per page would allow custom layout but risks visual and behavioral drift across the three views.

## Decision: Add a shared top-filter content region to the work-view layout

**Rationale**: `WorkViewLayout` already owns the common result summary and content boundary for all three pages. A shared region there guarantees consistent placement without changing the global app header or work-view-specific tools.

**Alternatives considered**: Moving the filter bar independently in each page duplicates layout decisions and increases the chance of inconsistent spacing or ordering.

## Decision: Keep current filter semantics and split only presentation responsibilities

**Rationale**: Priority/type/status are multi-select, assignee is single-select with shortcuts, and the recent-done checkbox has separate state. Present the common filters in the requested assignee/status/priority/type order in a single desktop row; keep the recent-done control in the existing control area.

**Alternatives considered**: Reworking URL state or merging recent-done into status would change established semantics and is outside this feature. Narrow layouts may wrap the row while preserving order.

## Decision: Use existing styles and no new dependency

**Rationale**: The project already has theme tokens, badge styles, responsive breakpoints, CSS layout, and Storybook examples. These cover the requested compact and localized presentation.

**Alternatives considered**: A new component library or a bespoke large panel adds dependencies and visual weight without enabling required behavior.
