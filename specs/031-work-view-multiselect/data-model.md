# Data Model: 工作檢視多選篩選

This feature changes only transient work-view query state. It adds no persisted entities and does not copy Issue data from Gitea.

## WorkViewFilters

Represents conditions shared by List, Kanban, and Gantt in the current workspace.

| Field | Values | Meaning |
|---|---|---|
| `priority` | zero or more of `critical`, `high`, `medium`, `low` | An Issue passes when its normalized priority is any selected value. Empty means unfiltered. |
| `issueType` | zero or more of `bug`, `feature`, `task` | An Issue passes when its normalized type is any selected value. Empty means unfiltered. |
| `state` | zero or more of `todo`, `in-progress`, `done` | An Issue passes when its Portal Status is any selected value. Empty means unfiltered and retains current anomaly visibility. |
| `assignee` | `all`, `me`, `unassigned`, or one Gitea login | Retains existing single-value matching behavior. |
| `repository` | `all` or `owner/repository` | Internal scope for a Repository route; not a selectable shared filter. |

Priority, Issue Type, and Status use OR within each field; all non-empty fields and Assignee use AND. When Status contains one or more values, anomalous Status Issues do not match.

## Unfinished preset

“Unfinished” is a derived shortcut over `state`, not a separate stored value. Activating it sets `state` to exactly `todo` and `in-progress`. Its pressed state is true when both values are selected, even if the user later also selects Done. Activating it again resets the set to those same two values.

## URL values

Each selected Priority, Issue Type, or Status value is represented by a repeated query key. A missing key or a key whose values all fail validation represents an empty selection. Valid values are deduplicated; invalid values do not invalidate valid siblings. Existing single-value URLs remain valid.

Each user filter change is a separate browser history entry. Returning to a prior history entry restores its valid filter values and matching results.

## Existing Issue data

Issue priority, type, status, assignees, and anomaly details continue to come from normalized Gitea-backed Issue results. Gitea remains the sole source of truth.
