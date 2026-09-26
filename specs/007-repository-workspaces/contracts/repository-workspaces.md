# Repository 工作區 API 與 URL Contracts

所有 API 使用 Portal session 的 Gitea delegated credentials。回應不得包含 token 或寫入 Issue/Board mirror。

## Web routes

| Route                                 | Meaning                                                              |
| ------------------------------------- | -------------------------------------------------------------------- |
| `/issues`                             | 全部可讀 Repository 的既有 Issues 清單                               |
| `/repositories/:owner/:repo/issues`   | 單 Repository Issues；filter/page 保存在 query                       |
| `/repositories/:owner/:repo/kanban`   | 單 Repository Kanban                                                 |
| `/repositories/:owner/:repo/gantt`    | 單 Repository 甘特圖                                                 |
| `/boards/:id/issues`                  | Board refs 範圍內 Issues；filter/page 保存在 query                   |
| `/boards/:id` or `/boards/:id/kanban` | 現有 multi-repo Board Kanban；單 repo legacy record 顯示重新分類說明 |
| `/boards/:id/gantt`                   | 現有 multi-repo Board 甘特圖                                         |
| `/boards`                             | 只管理至少涵蓋兩個 Repository 的跨庫看板                             |

Existing `/boards/:id[/kanban|gantt]` single-repo Board URLs show an explanatory page that asks the user to select a Repository from the workspace selector; they do not auto-redirect or call a Board view API. Multi-repo URLs remain unchanged. Existing root, `/issue/...`, `/boards?view=...`, `/kanban` and `/gantt` aliases retain current meaning.

## Read API

### Existing Repository and single-repository Issues APIs

- `GET /api/repositories` returns every repository page visible to the current user, with nullable exact `conventionId` and `conventionVersion`.
- `GET /api/issues?repository={owner/name}&q=&state=&assignee=&label=&milestone=&page=&limit=` remains the Repository Issues read path; response remains `{ items, page, limit, hasNext }`.
- Existing `POST /api/repositories/:owner/:repo/issues` remains the create path; repository workspace sets that repository as the selected target.

### Repository workspace views

- `GET /api/repositories/:owner/:repo/kanban` returns `{ repository, conventionId, conventionVersion, columns }`, where `columns` reuse existing BoardColumn semantics and contain all Gitea Issue pages.
- `GET /api/repositories/:owner/:repo/gantt` returns `{ repository, issues }` for all Issue pages and existing schedule fields.
- `POST /api/repositories/:owner/:repo/issues/:number/transition` accepts `{ stateKey }`, checks current user Label permission, exact Convention state, preserves non-Workflow Labels, performs one atomic replacement with concurrency checks, and returns the refreshed Issue.
- Missing/incompatible Convention yields a specific client-readable error. Repository Issues APIs continue working without a Convention.

### Board Issues

- `GET /api/boards/:id/issues?q=&state=&assignee=&label=&milestone=&page=&limit=` returns `{ board, items, page, limit, hasNext }`.
- The service reads all pages from every board Repository, applies the same filters per repo, merges with `updatedAt` descending and stable identity tie-break, then paginates the combined result.
- A missing Board, permission denial, or failure reading any required Repository/page returns an error; no partial page is represented as complete.

### Existing Board view compatibility

- Existing `GET /api/boards`, `GET /api/boards/:id`, `GET /api/boards/:id/gantt`, and Board transition route continue serving all persisted records internally.
- The Web selector/settings page filters Board items to `repositoryRefs.length >= 2`; Board create/update validates at least two unique refs and the existing exact Convention compatibility.
- On legacy single-repo Board URLs, Web loads Board metadata from the existing Board list. For a single-repo record it shows a notice that asks the user to reselect the Repository in the workspace selector; it does not automatically open the associated Repository or call a Board view endpoint.
- Repository Kanban/Gantt uses the Repository's current YAML assignment. If it differs from a retained legacy Board's Convention, show an informational configuration notice while continuing with the YAML assignment; if that assignment is missing or cannot exact-match an available Convention, show the existing actionable configuration error.
- JSON store accepts old nonempty one-repo records so settings remain preserved; it does not rewrite or delete them.

## Issue detail return contract

Scoped Issue links use the existing `/issues/:owner/:repo/:number` detail route plus `returnTo=<encoded-local-path-and-query>`. The app validates the target against known Portal route patterns and rejects protocol-relative, absolute, and unknown paths. Invalid or absent values return to `/issues`.
