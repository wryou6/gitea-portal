# Quickstart: Dashboard 與共通工作介面

## Prerequisites

- Node.js 22, pnpm 9, project dependencies installed.
- A configured Gitea instance and authenticated Portal user for manual workspace checks.
- The user can read at least one Repository; optional checks can include a readable cross-repository Board and a Board with a Repository the user cannot read.

## Build Validation

From the repository root run:

```powershell
pnpm.cmd typecheck
pnpm.cmd build
```

Expected: both commands complete successfully.

## Manual Scenarios

1. Open `/` and `/dashboard`; both show the Dashboard directory and its active page indicator.
2. Open `/issues`; confirm the existing all-Issues page remains available.
3. With readable repositories and boards, verify each readable Repository and each fully readable cross-repository Board is listed. Verify a Board with any unreadable Repository is omitted.
4. Open a Repository item and a Board item. Verify their Issues views retain context when choosing Kanban/Gantt in the sidebar.
5. On Dashboard, Kanban, and Gantt, verify the non-link Gitea mark + `Gitea Portal` brand, matching browser tab title, and adjacent Dashboard link are identical; keyboard-focus and activate the link.
6. In Repository Kanban and Gantt, verify no dedicated “Back to repository issues” control appears. In cross-repository Board views, confirm the existing return-to-Board control remains.
7. With no workspaces, verify an empty state. Simulate failure of either workspace-list source and verify an error/retry state does not claim partial results are complete.
8. At a narrow viewport, verify the brand, Dashboard link, workspace selector, account controls, and main content remain usable.
