# Quickstart: 側邊導覽建立問題入口

## Local validation

1. Start the Portal using the existing local setup (`pnpm.cmd dev`) and sign in to Gitea.
2. Open All repos Issues, Kanban, and Gantt; verify each shows the global create entry and that it opens the existing create page with Repository selection available.
3. Open a Repository Issues, Kanban, and Gantt page; verify the entry preselects that Repository and preserves the source page return context.
4. Verify the Issues title area has no duplicate create action and the existing create form still loads from the sidebar entry.
5. Collapse the sidebar and use keyboard navigation; verify the create link remains named and operable.
6. Repeat in Traditional Chinese, English, and Japanese; confirm the create entry is localized and the Issues item reads `問題清單`, `Issue list`, and `課題一覧` respectively.
7. Run `pnpm.cmd typecheck` and `pnpm.cmd build` from the repository root.

## Expected result

One global sidebar create entry is available on authenticated pages, Repository scope is preserved where present, All repos retains Repository selection, and the existing create flow is unchanged.

## Storybook review

Use the `Layout/Portal shell` stories `PageComposition`, `RepositoryWorkspace`, `AllReposCreateRoute`, and `RepositoryCreateRoute`. Check the active entry, link name, repository context, and removed Issues-page title action in zh-TW, English, and Japanese; toggle the sidebar to confirm collapsed behavior.

## Validation record — 2026-09-30

- Reviewed all four stories. All repos links use the existing global create route; Repository links include the current Repository and source URL. Create routes mark only Create as current while the workspace selector retains the source Repository.
- Checked zh-TW, English, Japanese, expanded and collapsed sidebar, keyboard Tab focus, and 375px width. The link keeps its accessible name; the browser console error list was empty.
- Screenshots: `output/playwright/sidebar-create-repository-desktop.png` and `output/playwright/sidebar-create-repository-mobile-collapsed.png`.
- `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd --filter @gitea-portal/web build-storybook` passed. Storybook build emitted its existing `eval` and large-chunk warnings.
- No Gitea Issue was submitted during this entry-move change; the existing create page and write flow were not modified.
