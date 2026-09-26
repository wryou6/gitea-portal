# Quickstart: Issue 排程日期與甘特圖

## Prerequisites

- Node.js 22, Corepack/pnpm 9, and an accessible Gitea instance.
- OAuth account with delegated read/write permission for a test Repository and an existing Board configured with that Repository.
- Local `.env` configured per repository README; do not commit credentials.

## Build and type validation

```powershell
pnpm.cmd install
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd dev
```

## Manual acceptance scenarios

1. In the Portal, create or edit an Issue with a start date and due date. Refresh the detail page and verify both dates match Gitea; verify the Issue's complete Labels remain visible and unrelated Workflow Labels remain assigned.
2. Clear the start date only, reload, and confirm due date remains. Clear due date only and confirm the start date remains.
3. Try a date write with an account lacking Gitea write permission; verify an error is shown and no unsaved value appears as persisted.
4. Edit the same Issue's labels in Gitea between Portal read and save; verify optimistic concurrency rejects the stale replacement and preserves the concurrent Gitea edit.
5. Create Board Issues with both dates, start-only, due-only, neither, malformed/duplicate start-date labels, and a start date after due date. Verify ranges, single-day items, the no-date `未排程` section, and visible anomalies.
6. Put more than 100 Issues in a Board Repository; verify Gantt includes all pages. Make a later Gitea page unavailable during load; verify Portal shows an error rather than a partial chart.
7. Open the Board's distinct `/boards/:id/kanban` and `/boards/:id/gantt` URLs and navigate between them; verify default current-user assignee, assignee changes, and Open/Closed filters without changing Gitea Issue state. The legacy `/boards/:id` URL opens Kanban.
8. At 375 px viewport and keyboard-only navigation, verify Issue identity, dates, filters, and Issue detail links remain accessible through the non-Canvas list.

## Expected outcome

All persisted date values come from Gitea. Gantt single-day inference affects display only, no-date Issues remain discoverable below the chart, and no required page failure is presented as a complete Board.
