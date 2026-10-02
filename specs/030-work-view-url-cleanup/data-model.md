# Data Model: 工作檢視網址參數範圍

This feature introduces no persisted or server-side entities. It formalizes browser URL state:

| State group | Keys | Scope |
|---|---|---|
| Shared work-view filters | `priority`, `issueType`, `state`, `assignee` | List, Kanban, and Gantt; preserved across view and workspace navigation |
| Gantt view state | `gantt_start`, `gantt_scale` | Gantt URL and return targets that point to the originating Gantt view |
| List sort state | `sort`, `direction` | Preserved only when both source and destination are List, including List return targets; not copied to Kanban or Gantt |
| Retired Gantt filters | `gantt_open`, `gantt_closed`, `gantt_assignee` | Removed on the next applicable filter or navigation update |
| Issue return target | `returnTo` | Issue detail/create URL; identifies the originating supported route and its applicable state |

The selected route remains authoritative for workspace scope. No query key changes Gitea data or permissions.
