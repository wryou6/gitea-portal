# Quickstart: 最近完成項目篩選與完整 Issue List

## Prerequisites

- A configured Portal instance with an authenticated Gitea account that can read at least one repository.
- Issues with Done status closed today, on the 30-day boundary, and before the boundary; also include Todo, In Progress, and a Done item with no usable close timestamp if available.
- Enough matching Issues to exceed the former 50-item Issue List page.

## Validation scenarios

1. Open All repos and a single Repository in Issues List, Kanban, and Gantt. Confirm the checkbox starts checked in each view.
2. With the checkbox checked, confirm Done items closed today and on local today minus 29 days are visible, older Done items are hidden, and Todo, In Progress, and anomalous items are unaffected.
3. Uncheck the control. Confirm older Done items appear immediately, the upper-left result count updates, and the localized “Completed: last 30 days” condition disappears. Recheck and confirm the recent-only result and condition return.
4. Combine the control with Status, Assignee, Repository, Label, and Milestone filters. Confirm other filters remain unchanged and the completion rule only affects Done items.
5. Reload or navigate away from the work view and return. Confirm the checkbox defaults to checked and its value was not added to the URL.
6. Open Issue List with more than 50 matching Issues. Confirm the sorted list contains every match in one continuous, vertically scrollable table with no page controls; changing recent-Done or other filters still shows the complete matching set.
7. Cause a required Gitea repository/page read to fail. Confirm the Issue List reports a read failure instead of presenting a partial result as complete; confirm zero matches remain a distinct empty state.
8. Review the checkbox label, accessible name, keyboard operation, and upper-left result count/condition summary in zh-TW, en, and ja, including a narrow viewport.

## Repository checks

```powershell
pnpm.cmd typecheck
pnpm.cmd build
```

Both commands must complete successfully after implementation.
