# Status Definition Contract

## `GET /api/status-definition`

Returns the fixed Portal Status states and action definitions used by Issue detail and Kanban transitions. State keys are `todo`, `in-progress`, `done`; action keys preserve the existing stable keys and transition semantics. Todo and In Progress map to `status:todo` and `status:in-progress`; Done maps to Gitea Closed and has no Status Label.

Portal Issue `status` must not be confused with native Gitea `state` (`open | closed`). All writes use `status:` for the two open states and `status-action:<key>` for action reason labels.
