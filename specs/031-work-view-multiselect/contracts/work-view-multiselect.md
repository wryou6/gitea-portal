# Contract: 工作檢視多選篩選

## Shared view URL

The route continues to determine the workspace and view. Shared filter values are:

| Query key | Allowed values | Multiplicity |
|---|---|---|
| `priority` | `critical`, `high`, `medium`, `low` | Repeat once per selected value |
| `issueType` | `bug`, `feature`, `task` | Repeat once per selected value |
| `state` | `todo`, `in-progress`, `done` | Repeat once per selected value |
| `assignee` | `me`, `unassigned`, or a Gitea login | Single value |

For example, two selected statuses appear as `state=todo&state=in-progress`. Missing multi-value keys mean unfiltered. Invalid values are ignored individually, and valid values remain active. Navigation among List, Kanban, and Gantt preserves every valid repeated value. Existing Gantt and List view-specific query parameters retain their established behavior.

Every filter change creates a browser history entry. Browser back/forward restores that entry's valid filter values and matching results in the current view.

The “Unfinished” shortcut sets the Status values to exactly `todo` and `in-progress`; it is not serialized as a separate value. It is shown as selected when those two Status values are both selected.

## `GET /api/issues`

- `priority`, `issueType`, and `state` accept repeated values using the same allowed values above.
- Matching uses OR within each multi-value key and AND across different keys and the existing Assignee condition.
- Portal Status values continue to match normalized Portal Status, including the mapping of Todo/In Progress to Open and Done to Closed where Gitea state is used.
- Filtering applies to the complete authorized read-through Issue result before sorting and response construction. Response shape, workspace authorization, and whole-result failure behavior remain unchanged.
- A request with one value remains compatible with the existing single-value query form.

## Shared filter controls

- Priority and Type existing Badge options independently toggle selected values; no extra filter-value Badge is added.
- Status values independently toggle. “Unfinished” replaces the Status set with Todo and In Progress.
- “All” clears only that category. Removing an applied-value chip removes only that selected value; removing its final value clears that category.
- Selected options expose their state to assistive technology. Visible copy and accessible names support zh-TW, en, and ja.
