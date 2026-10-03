# Quickstart: 工作檢視多選篩選

## Prerequisites

- Install dependencies from the repository root with `pnpm.cmd install` if needed.
- Use Storybook stories for deterministic filter UI review; authenticated Gitea access is needed only for live cross-view scenarios.

## Storybook scenarios

1. Open `Work views/Shared filters` and select Unfinished. Confirm Todo and In Progress are selected and Done is not.
2. Toggle In Progress off; confirm only Todo remains selected. Select Unfinished again; confirm it resets to exactly Todo and In Progress.
3. Select multiple Priority values and multiple Type values. Confirm each selected value has pressed styling and an applied-filter chip.
4. Remove one chip and confirm other choices remain. Remove the last chip in a category and confirm that category returns to All.
5. Open a URL-restoration story with repeated and invalid query values. Confirm valid unique values remain selected and invalid values are ignored.
6. Change filters several times, then use browser back and forward. Confirm each history entry restores the matching selected values and results.
7. Review narrow viewport, keyboard focus, and zh-TW/en/ja labels.

## Workspace validation

From the repository root run:

```powershell
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd --filter @gitea-portal/web build-storybook
```

Expected result: all commands complete successfully. The Storybook build contains the multi-select and shortcut states without requiring a live API.

## Validation results (2026-10-03)

- `pnpm.cmd typecheck` — passed for all workspace packages.
- `pnpm.cmd build` — passed for domain, Gitea contracts, web, and API packages.
- `pnpm.cmd --filter @gitea-portal/web build-storybook` — passed; Storybook static build completed.
- Authenticated cross-view behavior and browser back/forward have not been exercised against a live Gitea session; use the scenario above for that runtime check.

## Authenticated work-view scenario

1. In a readable workspace, select two Statuses, two Priorities, and two Types.
2. Confirm List, Kanban, and Gantt show the same matching Issue set within that workspace.
3. Change filters several times and use browser back/forward. Confirm each prior selection and result restores; copy/reload a URL and switch views to confirm values persist.
4. Select Unfinished, remove In Progress, and confirm only Todo Issues remain in each view.
5. Confirm no Gitea Issue labels, state, or other data changed as a result of filtering.
