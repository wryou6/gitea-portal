# Data Model: 工作檢視篩選列版面

This feature adds no persisted or domain data.

## Presentation Regions

| Region | Contents | State source |
|---|---|---|
| Common filters, row 1 | Priority, issue type, status | Existing `WorkViewFilters` values and page callbacks |
| Common filters, row 2 | Assignee shortcuts and selector | Existing `WorkViewFilters.assignee` value and page callbacks |
| Existing control area | Recent-done visibility and view-specific tools | Existing view/page state |
| Result summary | Result count, recent-done summary, active filter labels | Existing `WorkViewLayout` inputs and filter-label helper |

Priority/type/status remain multi-select; assignee remains single-select. URL serialization, history entries, matching, Gitea data, and persistence are unchanged.
