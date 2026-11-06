# Quickstart: Repository 工作區與跨庫看板

## Prerequisites

- Node.js 22, pnpm 9, an authorized Gitea test account, and the current portal `.env` configuration.
- At least two readable test repositories assigned to the same exact Workflow Convention; one repository without a Convention for the unavailable-view scenario.
- One existing multi-repo Board; a disposable Board-store fixture with a single-repo legacy Board; a test repository with more than 100 Issues for pagination coverage.
- Do not use elevated credentials or change production Issues. Use disposable test repositories for Issue/Label transition scenarios.

## Start and build

```powershell
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd format:check
pnpm.cmd dev
```

Open the Web app at `http://localhost:5173`; API is `http://localhost:3001`.

## Acceptance scenarios

1. **Repository scope**: Select `owner/repo` in the topbar, visit Issues/Kanban/Gantt, and verify every view identifies and contains only that repository. Create an Issue from this context and verify the repository is preselected and Gitea is the persisted result.
2. **All pages**: Use a test Repository with more than 100 Issues. Verify Kanban and Gantt contain later-page Issues; the Issues list moves through pages. Select a Board spanning two repos and verify its Kanban/Gantt and Board Issues include all scoped pages without duplicate identities.
3. **Board aggregation**: Filter the Board Issues list by state, label, assignee and query. Verify the merged order is stable and each row identifies owner/repo plus Issue number. Simulate one repo/page read failure and verify the view reports failure instead of a partial success.
4. **Multi-repo Board validation**: Attempt to create/save a Board with one ref and verify a field-level/inline message; create a Board with two convention-compatible refs and verify it appears as 「跨庫看板」.
5. **Legacy Board**: Seed an isolated `BOARD_STORE_PATH` with a one-repo Board. Verify its record/name/Convention remain unchanged and absent from Board selection/management. Opening `/boards/:id`, `/boards/:id/kanban`, or `/boards/:id/gantt` must show a reclassification notice and ask the user to reselect the Repository; it must not auto-open the repository route or call Board view APIs. In the Repository workspace, verify Kanban/Gantt use current YAML and show a notice if its Convention differs from the retained legacy fields.
6. **Convention states**: For a repo without Convention, verify Issues works and Kanban/Gantt show an actionable setup error. For a stale/mismatched version, verify a specific error rather than selecting a fallback Convention.
7. **Permissions and transitions**: With a user lacking repo read access, verify the workspace/Board is unavailable and no partial Board is shown. With read but no label-write permission, verify drag transition or workflow repair is denied without pretending success; with permission, verify Workflow Label replacement is atomic and other labels remain.
8. **Detail return**: Open Issue detail from each scoped list and Gantt. Use back action and verify the same repository/Board view, filters and page return. Direct detail links with invalid `returnTo` fall back to global `/issues`.
9. **Responsive and keyboard navigation**: At 375 px width, operate the workspace selector and Issues/Kanban/Gantt links with keyboard only. Confirm visible focus, selected context announcement, no page-level horizontal overflow, and no sidebar/topbar overlap. When a fully accessible cross-repository Board is selected, verify that 「跨庫看板設定」 appears; switch to a Repository or all Issues and verify that it disappears. It should also stay hidden for an inaccessible or missing Board.
10. **View navigation**: On Repository and Board Kanban/Gantt pages, verify the content area has no local button for switching between Kanban and Gantt; verify the global sidebar still switches views.
11. **Regression routes**: Verify `/`, `/issues`, `/issues/new`, existing Issue detail URLs, `/kanban`, `/gantt`, `/boards?view=...`, existing multi-repo Board Kanban/Gantt URLs retain their previous destinations, and the three legacy Board paths with optional view segment show the reclassification notice.

## Expected result

All Issue results are Gitea read-through data scoped to the selected Repository/Board. Any required Board read failure is an error. No workspace/Issue data is written to Portal persistence; only the existing Gitea Issue operations and existing Board configuration operations persist changes.
