# Quickstart: Issue detail dialog

## Prerequisites

- 依根目錄 README 完成 `.env` OAuth 設定並可登入 Portal。
- 取得至少一筆可讀 Issue，並確認可進入 All repos 或 Repository 的 Issue List、Kanban、Gantt。

## Static validation

```powershell
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd --filter @gitea-portal/web exec storybook build
```

Expected: all commands complete successfully; no API/domain/Gitea contract changes are required.

## Browser acceptance

1. In each of Issue List, Kanban, and Gantt, click an Issue key/title link. Confirm only those links open a centered dialog, the address bar shows that Issue URL, and the original view remains mounted with its filters, sort, and scroll position.
2. Confirm the modal has description, complete Labels, Comments, edit and Status controls. Check loading/error feedback using the existing Issue detail behavior.
3. Close with the close control, Escape, backdrop and browser Back; each should return to the source view. When the nested Status transition dialog is open, Escape should close only that topmost dialog. Confirm List sort/filter and Gantt range remain as before opening.
4. Expand the dialog to the full page, then use browser Back; it should return to the source view.
5. Copy/open the Issue URL in a fresh tab and reload it. Both should display the full Issue page, not a dialog.
6. Verify Kanban drag-to-transition and Gantt bar/handle schedule operations still work; clicking Issue key/title still opens the dialog.
7. With keyboard only, open from a key/title link, Tab through dialog actions, close with Escape, reopen and close with the close control, and expand to the full page. Confirm focus returns to the activating link on dismissal and that the expanded page is usable.
8. Repeat the dialog and expand flows in zh-TW, en, and ja. At a narrow viewport, confirm the dialog is near full screen, its body scrolls, and both header controls remain visible.

## Validation record

- 2026-10-12: `pnpm.cmd typecheck` passed for all four workspaces.
- 2026-10-12: `pnpm.cmd build` passed for all four workspaces. Vite reported the existing 500 kB chunk-size advisory.
- 2026-10-12: `pnpm.cmd --filter @gitea-portal/web exec storybook build` passed, including the new loading, loaded, error, nested Status dialog/focus, and direct-page stories. Storybook reported chunk-size and upstream eval advisories.
- 2026-10-12: React Router Data Router history smoke check passed: masked navigation retained `/issues` as the router location, exposed `/issues/example/portal/42` as `location.mask`, and Back restored the source entry and query.
- Live browser acceptance is still pending. The browser automation surface was unavailable in this run, so the issue-key click, visible dialog, history, and Gitea-backed operations have not been confirmed in a real browser.
