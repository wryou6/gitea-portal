# Contract: 工作檢視篩選與頂部搜尋

## Shared view URL

The current workspace and view remain identified by the existing route. Shared filter keys are:

| Query key | Accepted values |
|---|---|
| `priority` | `critical`, `high`, `medium`, `low` |
| `issueType` | `bug`, `feature`, `task` |
| `state` | `todo`, `in-progress`, `done` |
| `assignee` | `unassigned` or a Gitea login |
| `repository` | `owner/repository` (All repos only) |
| `label` | Exact Label name |
| `milestone` | Exact Milestone title |

Absent keys mean unfiltered. Invalid keys/values are ignored. A changed filter is reflected in the current URL immediately. The current route's workspace boundary remains in effect for shared filters. Navigation among List, Kanban, and Gantt preserves the shared keys. Gantt retains `gantt_start` and `gantt_scale`; the prior `gantt_open`, `gantt_closed`, and `gantt_assignee` keys are no longer controls.

## `GET /api/issues`

Continue accepting existing query values for repository, state, assignee, label, milestone, page, sort, direction, and limit. Add:

- `priority`: one of `critical`, `high`, `medium`, `low`.
- `issueType`: one of `bug`, `feature`, `task`.

Both new filters are applied to the complete authorized read-through result set before sorting and pagination. Existing maximum page size and response shape remain unchanged. No Gitea API contract or write behavior changes.

## Top-bar Issue search

- Search scope: all repositories readable by the current authenticated Gitea user, independent of selected workspace.
- Matching fields: Issue title, body, number, and repository identity, following the current keyword search behavior.
- Results: accessible dropdown items identify Repository and Issue; selecting an item opens its Issue detail and supplies the originating URL as the return target.
- The dropdown exposes loading, no-results, and read-error states. Keyboard focus and selection are operable; Escape dismisses the dropdown without changing the current route.
- Search text is not a shared-filter chip and is not persisted as filter state. Dismissing the dropdown leaves the current route and filter URL unchanged.
