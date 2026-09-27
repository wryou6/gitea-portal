# UI Navigation Contract

## Routes

| URL | Behavior |
|---|---|
| `/` | Render Dashboard as the default page |
| `/dashboard` | Render Dashboard; canonical destination of the Dashboard link |
| `/issues` | Preserve the all-accessible-issues page |
| `/repositories/{owner}/{repo}/{issues|kanban|gantt}` | Preserve current Repository workspace context and selected view |
| `/boards/{boardId}/{issues|kanban|gantt}` | Preserve current cross-repository Board context and selected view |

Unknown paths retain the application's existing fallback behavior unless an existing route already handles them.

## Shared Header

- The brand is a non-interactive region containing the local Gitea SVG mark from `apps/web/public/favicon.svg` and visible text `Gitea Portal`; the browser tab title is `Gitea Portal` as well.
- A Dashboard anchor appears immediately after the brand. Its target is `/dashboard`; it exposes the current page state on `/` and `/dashboard`.
- The existing workspace selector, account menu, sidebar, and their current behavior remain available.
- On Dashboard, the workspace selector indicates `All workspaces`; selecting it returns to `/dashboard`. Dashboard owns workspace-source errors so the header selector does not duplicate them.
- The same AppShell header is used on Dashboard, Kanban, and Gantt pages.

## Dashboard Workspace Directory

- Read repositories from `GET /api/repositories` and Boards from `GET /api/boards` using existing authenticated client behavior.
- Include every returned readable Repository and only Boards whose full Repository set is readable by the current user.
- Repository links open that Repository's Issues workspace. Board links open that Board's Issues view. Existing sidebar navigation retains the selected context for Kanban/Gantt.
- Do not fetch Issues to render the directory or persist a copy of any source record.
- Show loading, empty, and error states distinctly. Do not describe partial results as the complete directory if either source request fails.

## View-Specific Navigation

- Repository Kanban and Gantt pages do not display a dedicated link/button that returns to Repository Issues.
- Cross-repository Board return navigation remains as-is.
- All global navigation remains keyboard-operable with visible focus and accessible names.
