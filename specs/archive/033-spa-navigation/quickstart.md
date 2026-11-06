# Quickstart: 站內畫面切換不閃白

## Preconditions

- Start local Gitea, Portal API, and Vite Web using the existing project setup.
- Sign in to Portal with an account that can read the test repositories.
- Run `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd --filter @gitea-portal/web build-storybook`.

## Authenticated browser scenarios

1. Capture `performance.getEntriesByType("navigation").at(-1)` and the current `#root`/AppShell state.
2. From the sidebar, switch List → Kanban → Gantt → Dashboard → Settings. Confirm the document navigation entry count does not increase and the AppShell remains mounted.
3. Capture a short video or sample the visible app at approximately 16 ms intervals. Confirm there is no full-screen blank/white frame; page-specific existing loading state is allowed inside the content region.
4. Open an Issue from List, Kanban, and Gantt; use its return link and verify the source route and URL state restore.
5. Change multi-select filters, List sort/direction, and Gantt start/scale. Use Back and Forward and verify the URL, controls, and results agree.
6. Switch All repos and Repository workspaces. Confirm the destination view retains only query state allowed by Feature 030 and 031.
7. Open a Dashboard card, Issue search result, and Issue-create success destination. Confirm each stays within the Portal without document navigation.
8. Open an external Gitea link and exercise OAuth/logout. Confirm they still perform their full-document transitions.
9. In the current local Vite environment, directly open and refresh `/dashboard`, `/issues`, `/kanban`, `/gantt`, a Repository view, and an Issue detail URL. Confirm the intended destination appears; an invalid route shows Not Found.

## Expected outcome

- Same-origin Portal transitions do not create new document navigation entries.
- The shared shell remains mounted, and the destination page or its existing loading/error state appears without a full-screen blank frame.
- Work-view URL sanitization, Issue return URLs, and browser history match the behavior documented in Features 030 and 031.

## Acceptance results (2026-10-03)

- Authenticated through the local Gitea OAuth flow with the provided test account.
- Switched Issue List → Dashboard → Kanban. `performance.getEntriesByType("navigation").length` stayed at `1`; during 30 animation-frame samples after the Dashboard → Kanban switch, the same `.app-shell` node remained mounted and there were `0` samples with a zero-height shell or `<main>`.
- Clicked Priority → High in Issue List; the URL gained `priority=high`. Browser Back restored the URL without that filter, and the selected filter returned to `All`.
- Ctrl+click on Dashboard opened a second tab while the current tab stayed on Issue List.
- Direct open and refresh succeeded for `/dashboard`, `/issues`, `/kanban`, `/gantt?gantt_scale=week`, `/repositories/admin/portal-test-web/issues`, and `/issues/admin/portal-test-web/1`. The pages rendered Dashboard, Issue list, Kanban, Gantt Chart, `admin/portal-test-web`, and the Issue title respectively. Gantt retained the Week scale; Issue List and Repository Issue List normalized the default sort into the URL.
- `/no-such-route` rendered the existing `404` page.
- OAuth sign-in used a full-document transition to local Gitea. Code inspection confirms logout still uses the existing API followed by `window.location.assign`, and the Issue detail Gitea link remains a normal external anchor.
- `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd -C apps/web build-storybook` passed. `pnpm.cmd format:check` remains failing because Prettier reports 224 repository files, including many untouched files and some files in this feature; no repository-wide reformat was applied.

## Hosting note

The repository configures Vite for local development but contains no production static-host or reverse-proxy configuration. Before deployment, the hosting environment must route Portal paths to the Web entry document and preserve API/auth routing.
