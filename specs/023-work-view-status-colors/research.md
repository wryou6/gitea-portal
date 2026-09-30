# Research: Issue List 斑馬紋與 Gantt Status 色彩

## Current UI

- `IssueListPage` renders each Issue through `IssueRow` with the `issue-table-row` class. The table already has a hover background, but no alternating row background.
- Status markup differed between List, detail and Gantt; detail omitted the shared `issue-status` base styles, so its badge geometry and color presentation could diverge.
- Type and Priority badges used separately named but nearly identical light/dark color palettes; generic Gitea Label badges were neutral.
- `GanttIssueRow` renders Status as an `issue-status` badge and renders every schedule bar with the same primary color. Its outer `.gantt-row` does not currently expose Status to CSS.
- Gantt scheduled, unscheduled and anomalous rows all share `GanttIssueRow`; assigning a Status data attribute there covers all three cases without changing grouping or issue data.
- Theme variables already define light/dark surfaces; existing badge colors provide accessible foreground/background/border pairs for red, amber, orange, blue and green roles.

## Decisions

1. Consolidate Status, Type and Priority variants onto five shared badge palette roles, with theme-specific accessible foreground/background/border tokens. Keep Gitea Labels neutral.
2. Use one `IssueStatusBadge` component around the existing shared `Badge` primitive to prevent List, detail and Gantt markup from diverging.
3. Mix each Status accent with the current card surface for Gantt rows; use the same accent for schedule bars and semantic badge colors.
4. Use the theme's muted surface mixed with the card surface for List striping, and retain the existing hover selector at a stronger intensity.
5. Add one Storybook palette showing all badge families, plus focused List and Gantt states. No API or domain changes, localization changes, or new runtime dependency are justified.

## UI Review Guidance

- Data table rows should remain readable and must not overflow on mobile; preserve the existing horizontally scrollable table behavior.
- Gantt must preserve status text and anomaly annotation so color is not the only distinguishing signal.
- Inspect both themes, zh-TW/en/ja, desktop and narrow viewport using Storybook.
