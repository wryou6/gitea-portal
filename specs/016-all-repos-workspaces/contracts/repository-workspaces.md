# Repository Workspace Routes and API Contracts

All API requests use the signed-in session's Gitea delegated credentials. Repository enumeration and Issue operations MUST respect that user's Gitea permissions.

## Web routes

| Route | Meaning |
|---|---|
| `/` | All repos Gantt, the default signed-in view |
| `/issues` | All repos Issues; current query/filter/page parameters retained |
| `/kanban` | All repos Kanban |
| `/gantt` | All repos Gantt |
| `/dashboard` | Optional directory of All repos and readable Repositories |
| `/repositories/:owner/:repo/issues` | One Repository Issues |
| `/repositories/:owner/:repo/kanban` | One Repository Kanban |
| `/repositories/:owner/:repo/gantt` | One Repository Gantt |
| `/issues/:owner/:repo/:number` | Gitea Issue detail; `returnTo` must preserve the source scope/view/query |

Unknown paths, including `/boards` and `/boards/:id/...`, return a regular not-found page and make no retired API request. `/kanban` and `/gantt` no longer open selection/settings pages; they are All repos views.

## Existing and updated APIs

### Repository list and Issue list

- `GET /api/repositories` returns every repository visible to the current user via Gitea and serves as the All repos scope.
- `GET /api/issues?q=&repository=&state=&assignee=&label=&milestone=&page=&limit=` retains the existing issue-page shape `{ items, page, limit, hasNext }`.
- When `repository` is present, query only that Repository as today. When absent, enumerate readable repositories, read all Issue pages from each, apply filters, sort globally by `updatedAt` descending then repository identity/number ascending, then paginate. Any required list/page failure fails the whole response.
- `POST /api/repositories/:owner/:repo/issues` stays the create contract and validates Gitea create permission. All repos form starts with no Repository selected and calls this route only after explicit selection.

### Kanban and Gantt

- `GET /api/repositories/kanban` returns `{ repositories, columns }` for all readable repositories; each `columns` item has `{ stateKey, displayName, cards }` and each card retains owner/name/number, Issue fields, and presentation `visibleLabels`.
- `GET /api/repositories/gantt` returns `{ repositories, issues }` for all readable repositories and all Issue pages.
- Both aggregation routes fail the entire response if repository enumeration or any required Issue page fails; no partial result is returned.
- Existing `GET /api/repositories/:owner/:repo/kanban` returns `{ repository, columns }`; `GET /api/repositories/:owner/:repo/gantt` returns `{ repository, issues }`. Shared columns and issue shapes use neutral workflow/work-view contracts, not Board types.
- Existing `POST /api/issues/:owner/:repo/:number/transition` remains Issue-scoped and keeps Gitea authorization, atomic Label replacement, validation, and optimistic concurrency semantics.
- All `GET/POST/PATCH/DELETE /api/boards...` routes are removed.

## UI behavior

- Workspace selector contains All repos and readable repositories only; no separate duplicate All Issues choice or configurable collections.
- From All repos, Issue creation requires the user to explicitly choose a Repository; from a Repository workspace, preselect that Repository.
- Kanban cards and Gantt rows show Repository provenance in All repos, including for colliding Issue numbers.
- Storybook uses fictional Issues/repositories and covers scope switching, aggregate content, loading, empty, error/retry, narrow layout, light and dark themes.
