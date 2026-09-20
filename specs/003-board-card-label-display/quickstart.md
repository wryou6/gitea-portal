# Quickstart: Hide Workflow Labels on Board Cards

## Prerequisites

- Dummy Gitea is running and reachable by the existing API configuration.
- The user can read the Board repositories.
- The Board has an exact Workflow Convention with at least one state.
- Test Issues contain a mixture of Workflow Labels and ordinary Labels.
- Use `pnpm.cmd` on Windows when PowerShell script execution policy blocks `pnpm.ps1`.

## Build and type validation

From repository root:

```powershell
pnpm.cmd typecheck
pnpm.cmd build
```

Both commands must complete without errors.

## Scenario 1: Hide selected Workflow Labels

1. Prepare an Issue with `workflow-a:todo`, `bug`, and `priority-high`.
2. Open a Board using Workflow A.
3. Verify the Card appears in the Todo column.
4. Verify the Card does not show `workflow-a:todo` in its Label area.
5. Verify `bug` and `priority-high` remain visible.

Expected: the column communicates the workflow state and the Card shows only ordinary Labels.

## Scenario 2: Omit empty Label area

1. Prepare an Issue with only the Board Convention Workflow Label.
2. Open the Board.
3. Verify the Card remains identifiable by Repository, Issue number, Title, Assignee, and column.
4. Verify no empty Label container is displayed.

## Scenario 3: Preserve repair and anomaly information

1. Prepare an Issue with a missing or conflicting Workflow Label state that produces an automatic repair result.
2. Open the Board.
3. Verify a successful repair still places the Card in the correct default column.
4. For a failed repair, verify the anomaly column and readable repair error remain visible.
5. Verify Workflow Labels are not shown as ordinary Card Labels in either case.

## Scenario 4: Full Labels remain available outside Board Cards

1. From a Board Card, open the Portal Issue detail.
2. Verify the full Workflow and ordinary Labels are visible there.
3. Follow the original Gitea Issue link.
4. Verify Gitea still shows the complete Labels.

## Scenario 5: Read-only display behavior for valid Workflow state

1. Prepare an Issue with a valid Workflow Label and record its Labels before opening the Board.
2. Open and reload the Board multiple times.
3. Verify no Label is added, removed, or replaced by the `visibleLabels` display feature.
4. Open the Issue list and detail for the same Issue.
5. Verify their complete Labels remain unchanged.

For missing or conflicting Workflow Labels, validate the existing auto-repair behavior separately with Scenario 3.

## Scenario 6: Convention-specific filtering

1. Use a Board with a different Workflow Convention or an Issue containing labels from another convention.
2. Verify the selected Board Convention determines which Labels are treated as Workflow Labels.
3. Verify the UI does not rely on a hard-coded prefix or state name.

## Contract reference

See [board-card-label-display.md](./contracts/board-card-label-display.md) for the `visibleLabels` view contract and [data-model.md](./data-model.md) for invariants.
