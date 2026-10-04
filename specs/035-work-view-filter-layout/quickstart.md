# Quickstart: 工作檢視篩選列版面

## Prerequisites

- Install workspace dependencies with `pnpm.cmd install`.
- Run the Web/API development environment using the existing local Gitea setup, or review the existing Storybook stories.

## Validation Scenarios

1. Open All repos and a single Repository in List, Kanban, and Gantt. Confirm the desktop filter row contains assignee, status, priority, and type in that order, with each latter label left of its All option and all options on one line; confirm narrow layouts wrap without reordering.
2. Change and clear multiple filter values. Confirm results, active-filter chips, summary, URLs, and browser Back/Forward retain existing behavior.
3. Confirm the recent-done control and page-specific sort/Gantt/Kanban tools remain in their existing control area.
4. Review the layout at 1366×768 and a narrow viewport in Traditional Chinese, English, and Japanese. Confirm the four filter groups remain operable, the single desktop row has only subtle separation, no large panel is added behind it, and the page has no horizontal overflow.
5. Navigate with keyboard and inspect accessible labels, selected states, and visible focus.

## Commands

```powershell
pnpm.cmd typecheck
pnpm.cmd build
```

Expected outcome: both commands complete successfully; all three work views use the same filter order and preserve their current filtering behavior.
