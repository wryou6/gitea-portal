# Quickstart: Repository 與 All repos 工作區

## Automated project checks

Run from the repository root:

```powershell
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd --filter @gitea-portal/web build-storybook
```

## Signed-in Gitea scenarios

1. Sign in and open `/`; confirm the selected workspace is All repos and the first view is Gantt.
2. Switch All repos across Issues, Kanban, and Gantt. Confirm every accessible repository contributes its issues, repository identity is visible, and equal issue numbers remain distinct.
3. On All repos Issues choose Create Issue. Confirm no repository is preselected, submission stays disabled/invalid until a repository is chosen, and successful creation returns to the originating list query.
4. Open one Repository from the workspace selector. Confirm Issues, Kanban, and Gantt show only that repository. Create an Issue there and confirm its Repository is preselected.
5. Temporarily deny/fail one required repository or Issue page read. Confirm the aggregate view shows an error and retry action with no partial cards/rows. Restore access and retry.
6. Use an account with zero readable repositories. Confirm the All repos Gantt has a clear empty state and the selector does not list inaccessible repositories.
7. Open a retired `/boards` or `/boards/<id>/kanban` URL. Confirm a normal not-found view and no `/api/boards` request.
8. In the Storybook toolbar inspect All repos and Repository selector states; multiple repositories with the same Issue number; loading, empty, error/retry and populated Issues/Kanban/Gantt; narrow viewport, keyboard focus, and light/dark theme.
9. Confirm no Board store is initialized after API startup and the previous Board JSON, lock/temp files and local path setting are removed.
