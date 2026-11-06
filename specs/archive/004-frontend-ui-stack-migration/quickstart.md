# Quickstart: Frontend UI Stack Migration

## Prerequisites

- Windows PowerShell 5.1 or an equivalent shell.
- `pnpm.cmd` available on PATH. Use `pnpm.cmd` on this Windows host because the PowerShell shim may be blocked by execution policy.
- A running local API and reachable Gitea instance with the existing project environment configured.
- Dummy repositories and Issues may be used; do not place credentials in this document or in Storybook fixtures.

## Install and static gates

```powershell
pnpm.cmd install
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd format:check
```

Expected result: all commands complete successfully and the web bundle contains the new component styles without changing API or domain package build behavior.

## Run the application

```powershell
pnpm.cmd dev
```

Open the assigned Vite URL and verify these routes:

- `/` — Issue list, Repository/state/assignee/label/milestone filters.
- `/issue/new` — Issue creation.
- `/issue/<owner>/<repo>/<number>` — Issue detail, edit, comments, and Gitea link.
- `/boards` — Board list and editor entry.
- `/boards/<board-id>` — Cross-Repository Kanban.

## Run Storybook

```powershell
pnpm.cmd --filter @gitea-portal/web storybook
```

Review stories for shared buttons, fields, tables, dialogs, feedback states, Issue rows/cards, filters, Issue detail sections, Board cards, and Kanban columns. Confirm each relevant story covers loading, empty, error, permission, disabled, focus, and long-content states.

## Acceptance scenarios

| Scenario                        | Expected result                                                                                                                                    |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cross-Repository Issue browsing | One list clearly identifies Repository and Issue number while preserving title, state, assignee, labels, milestone, and updated time.              |
| Combined filtering              | Repository, state, assignee, label, and milestone filters can be combined without changing request semantics.                                      |
| Issue lifecycle                 | Create, edit, close, reopen, assign, label, milestone, and comment actions update the real Gitea Issue or show the server error.                   |
| Board setup                     | A Board only accepts Repositories compatible with the selected Workflow Convention and keeps the existing validation behavior.                     |
| Kanban transition               | Pointer and keyboard interactions request a workflow transition; the resulting state comes from the API/Gitea response.                            |
| Direct navigation               | Issue detail and Kanban cards open the original Gitea Issue in a clear, usable way.                                                                |
| Failure handling                | Loading, empty, error, forbidden, disabled, and mutation-pending states are visible and do not imply a mutation succeeded when it failed.          |
| Responsive/accessibility        | Layouts remain usable at 375/768/1024/1440 widths; controls have visible focus, labels, keyboard order, and a keyboard alternative to dragging.    |
| Legacy cleanup                  | Obsolete custom presentation files/classes are removed only after their responsibilities are migrated; no duplicate styling system remains active. |

## Data integrity checks

1. Change an Issue from the Portal, refresh, and verify the value remains in Gitea.
2. Change an Issue directly in Gitea, refresh the Portal, and verify the new value is rendered.
3. Move a Kanban card, refresh both Portal and Gitea, and verify the Workflow Label/state is consistent.
4. Verify a forbidden Repository or Issue cannot be reached through a new UI control.
