# Contract: 工作檢視網址狀態

## Portable state

| State | List | Kanban | Gantt | Issue return target |
|---|---|---|---|---|
| Priority, Issue Type, Portal Status, Assignee | Keep | Keep | Keep | Preserve the originating view's values |
| `gantt_start`, `gantt_scale` | Remove | Remove | Keep | Keep only when returning to an originating Gantt view |
| `sort`, `direction` | Keep when source is List | Remove | Remove | Keep only when the origin is List |
| Retired Gantt filters (`gantt_open`, `gantt_closed`, `gantt_assignee`) | Remove on next relevant URL update | Remove on next relevant URL update | Remove on next relevant URL update | Do not propagate |

## Navigation behavior

- Sidebar view navigation and workspace selection create a canonical destination URL and copy only state allowed by the source and target view.
- List sort and direction carry only to List destinations, including another List workspace; they do not carry to Kanban or Gantt.
- Switching from Gantt to List/Kanban removes Gantt date and scale. Switching from a non-Gantt source to Gantt uses the Gantt defaults unless the source is an Issue page whose validated `returnTo` points to Gantt.
- Shared filter changes retain applicable Gantt date/scale on Gantt, remove them on non-Gantt routes, and continue to clear retired Gantt filter keys.
- Issue return targets preserve route, workspace, and applicable state without promoting state from one view to another; a List origin retains List sorting.
- Unrelated destination parameters required by a route, such as Issue creation repository selection and `returnTo`, remain intact.

No API or Gitea data contract changes.
