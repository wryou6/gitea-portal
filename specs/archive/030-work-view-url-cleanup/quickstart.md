# Quickstart: 工作檢視網址參數範圍

## Preconditions

- Start the Portal with an authenticated Gitea user and at least one readable Repository.
- Use a Gantt URL with explicit `gantt_start`, `gantt_scale`, and a shared filter such as `priority=high`.
- Repeat scenarios in All repos and a Repository workspace.

## Manual acceptance scenarios

1. From Gantt, switch through the sidebar to List and Kanban. Confirm both URLs retain valid shared filters and omit `gantt_start` and `gantt_scale`.
2. From Gantt, use the workspace selector to switch to another Repository while retaining the current view. Confirm a Gantt destination retains Gantt state; a List/Kanban destination omits it.
3. Open an old List or Kanban URL containing Gantt keys, change a shared filter, then switch views. Confirm non-Gantt URLs no longer contain Gantt-only or retired Gantt filter keys.
4. From Gantt, open an Issue detail and an Issue creation page separately, then return. Confirm Gantt date, scale, and shared filters are restored.
5. From List and Kanban, open an Issue detail and return. Confirm no Gantt keys appear in the return URL. Then switch to Gantt and confirm its default date and scale are used.
6. Set List `sort` and `direction`, then switch to another List workspace or select List again. Confirm both values remain. Switch to Kanban/Gantt and confirm they are removed; an Issue return target from List retains the List sort values.

## Verification

```powershell
pnpm.cmd typecheck
pnpm.cmd build
```

Expected: all transitions produce URLs conforming to [work-view-url-state.md](contracts/work-view-url-state.md), and both commands complete successfully.

## Execution record (2026-10-03)

- `pnpm.cmd typecheck`: passed.
- `pnpm.cmd build`: passed.
- Seven direct URL-policy smoke scenarios covering view transitions, List sorting, Gantt return targets, and retired-key cleanup: passed.
- Authenticated Playwright walkthrough: passed. Gantt→List/Kanban retained shared filters and removed Gantt state; Gantt Issue detail/create return links restored date, scale, and filters; Gantt workspace switching retained those values; List sort/direction persisted across List workspaces and List Issue detail, then disappeared on Kanban/Gantt; Kanban Issue detail returned to its filtered URL; a legacy List URL automatically removed Gantt and retired Gantt keys.
- No Issue was created or modified during the walkthrough.
