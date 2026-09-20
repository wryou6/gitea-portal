# Quickstart: Workflow Default State Repair

## Prerequisites

- Dummy Gitea is running and reachable by the existing API configuration.
- The Portal can authenticate as a user with read access to the Board repositories.
- For success cases, the user has Gitea Label modification permission.
- The target Repository already contains every Workflow Label defined by its selected Convention.
- The selected Convention has at least one state and unique `order` values.
- Use `pnpm.cmd` on Windows when PowerShell script execution policy blocks `pnpm.ps1`.

## Build/type validation

From repository root:

```powershell
pnpm.cmd typecheck
pnpm.cmd build
```

Both commands must complete without errors after the feature is implemented.

## Scenario 1: Add the default state

1. In Gitea, create an Issue with ordinary labels such as `bug` and no Workflow Label from the Board Convention.
2. Load the Board in Portal.
3. Wait for the Board response/render to complete.
4. Verify the Card appears in the Convention state with the smallest `order`.
5. Verify in Gitea that the default Workflow Label was added and `bug` was preserved.
6. Verify the Card includes a successful repair indication for this load.

Expected: no `未設定狀態` column is shown when it becomes empty.

## Scenario 2: Repair a same-Convention conflict

1. In Gitea, give an Issue two or more Workflow Labels from the same Convention, plus at least one ordinary Label.
2. Load the Board.
3. Verify the Card ends in the default state after the load completes.
4. Verify Gitea contains exactly the default Workflow Label from that Convention.
5. Verify all ordinary Labels remain unchanged.

Expected: no `狀態衝突` column is shown when it becomes empty.

## Scenario 3: Preserve a failed repair

Run either failure setup:

- use a user without Label modification permission, or
- remove the Convention's default Label from the Repository.

Then:

1. Create or prepare an Issue with no Convention Workflow Label (or multiple same-Convention labels).
2. Load the Board.
3. Verify the Card remains in `未設定狀態` or `狀態衝突`.
4. Verify the Card shows a specific repair error such as permission denied or missing Label.
5. Verify Gitea Labels were not silently changed.
6. Verify other Cards still load and successful repairs still appear normally.

Expected: a later Board reload retries using current Gitea data; no Portal snapshot is used.

### Concurrent change failure

1. 使用者 A 載入含有未設定或衝突 Card 的 Board。
2. 在 Portal 完成 Issue 讀取、但尚未完成 Label replacement 前，使用者 B 直接在 Gitea 修改同一 Issue 的 Labels。
3. 讓使用者 A 的 Board load 繼續完成。
4. 驗證 Portal 拒絕覆蓋較新的 Gitea 資料。
5. 驗證 Card 保留 `未設定狀態` 或 `狀態衝突`，並顯示並行修改錯誤。

## Scenario 4: Distinguish Board read failure from Card repair failure

1. First verify the per-Card case by keeping Gitea Issue reads available but using a user without Label modification permission or removing the default Label.
2. Confirm the Board returns/render successfully, the affected Card shows its anomaly error, and other successfully read Cards remain visible.
3. For a separate read-failure run, temporarily change the API's Gitea Base URL to an unreachable test address.
4. Load the Board again and verify Portal shows one overall external-service error instead of presenting an incomplete Board.
5. Verify no Card is marked as repaired in either case unless Gitea confirmed the replacement.
6. Restore the correct Gitea Base URL and reload the Board.
7. Verify Portal retries using the current Gitea data.

Expected: read failure is a whole-Board error; post-read repair failure is a per-Card error.

## Scenario 5: Manually repair a failed Card

1. Use a Card left in an anomaly column by Scenario 3.
2. Drag it to a valid Workflow column.
3. If the user has permission and the target Label exists, verify Gitea contains only the selected Convention Workflow Label and the Card moves to that state.
4. If the write is rejected, verify the Card remains in its original anomaly column and the error remains visible.

## Scenario 6: Preserve normal columns, read-through behavior, and timing

1. Use a Board where no Card is in `未設定狀態` or `狀態衝突`.
2. Verify both anomaly columns are omitted.
3. Verify every Convention state column remains visible, including empty columns.
4. Open Issue list and Issue detail for the same Issues.
5. Verify those reads do not add, remove, or replace Workflow Labels.
6. For the Board repair scenario, measure elapsed time from starting the Board load until repaired/failed Card results are visible; verify it is no more than 3 seconds with the agreed dummy data set.

## Contract references

See [data-model.md](./data-model.md) for state transitions and [contracts/board-workflow-repair.md](./contracts/board-workflow-repair.md) for response/error shapes.
