# Data Model: 工作檢視共用篩選

This feature adds view/query state only. It does not add persisted entities or copy Issue data from Gitea.

## WorkViewFilters

Represents shared filters for the current workspace's List, Kanban, and Gantt views.

| Field | Values | Meaning |
|---|---|---|
| `priority` | `all`, `critical`, `high`, `medium`, `low` | Match the normalized Issue priority. |
| `issueType` | `all`, `bug`, `feature`, `task` | Match the normalized Issue Type. |
| `state` | `all`, `todo`, `in-progress`, `done` | Match Portal Status; `all` also retains anomalous Status Issues. |
| `assignee` | `all`, `unassigned`, or a Gitea login | A named login matches any member of the Issue assignee list. |
| `repository` | `all` or `owner/repository` | Select a repository only in All repos; single-Repository workspaces are fixed to their route. |
| `label` | Empty or exact Label name | Match an Issue carrying that Label. |
| `milestone` | Empty or exact Milestone title | Match an Issue assigned to that Milestone. |

`all` and empty optional values are defaults and are omitted from the URL. Values outside the enumerated domain are ignored when restoring a URL. Filter composition is AND across populated fields. Existing Status, Type, Priority, and Label interpretation remains authoritative; this feature does not repair missing or conflicting Issue metadata.

## GlobalIssueSearch

Transient top-bar input state containing the current keyword and result request state. Search scope is every repository returned to the authenticated user by Gitea, independent of the selected workspace. Matching reuses title, body, Issue number, and repository identity search. Results identify the Repository and Issue; selecting one navigates to its detail page. The source page URL remains the detail return target. Search overlay state is not persisted as a filter or cookie.

## Existing Issue data

Priority, Type, Status, assignee membership, Labels, Milestone, and Repository identity are read from existing normalized Gitea-backed Issue results. Gitea remains the sole source of truth.
