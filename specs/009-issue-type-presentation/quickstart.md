# Quickstart: Issue Type 呈現驗證

## Prerequisites

- Install workspace dependencies from the repository root with `pnpm.cmd install` if needed.
- Use the existing Storybook 8 setup in `apps/web`.

## Visual scenarios

1. Run `pnpm.cmd --filter @gitea-portal/web storybook` and open the displayed local Storybook URL.
2. Use the existing theme toolbar to inspect light and dark themes.
3. Inspect `IssueTypeBadge` for Bug, Feature, Task, missing Type, and conflicting/invalid Type labels.
4. Inspect Issue row and detail header stories: badge is in title area, before metadata; ordinary labels remain visible with no duplicate Type chip.
5. Inspect Kanban card stories: badge is before repository/assignee metadata; workflow label visibility, status selector, and repair annotations remain intact.
6. Inspect Gantt row stories for scheduled, unscheduled, and date-anomaly cases: badge remains in the title area and does not obscure the date track or anomaly message.
7. Inspect create/edit Type field stories: native selector remains keyboard-operable, option names are Bug/Feature/Task, and selected style matches the badge palette.
8. Inspect narrow viewports at 375px and desktop at 1280px; labels may wrap as a collection, but individual Type chips remain intact and readable.

## Automated project checks

From repository root, run:

```powershell
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd --filter @gitea-portal/web build-storybook
```

Expected: all commands complete successfully; Storybook contains the states above; no API or Gitea data change is required.
