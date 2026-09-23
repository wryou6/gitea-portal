# UI/API Preservation Contract

## Scope

This feature changes frontend presentation and component composition only. No new API contract is introduced. The existing API handlers under `apps/api/src` and the client boundary in `apps/web/src/lib/api.ts` remain authoritative.

## Existing routes the UI must preserve

| Capability           | Method/path                                                  | UI usage                                         | Preservation rule                                                                |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------ | -------------------------------------------------------------------------------- |
| Session              | `GET /api/session`                                           | Identify current user and permissions            | Keep current session interpretation and permission-denied rendering.             |
| Repositories         | `GET /api/repositories`                                      | Repository filters, Issue creation, Board editor | Do not expose repositories the API does not return.                              |
| Workflow conventions | `GET /api/workflow-conventions`                              | Board setup and workflow display                 | Keep exact Convention compatibility and returned order.                          |
| Issue list           | `GET /api/issues`                                            | Cross-Repository list/filter                     | Preserve query parameters, pagination/result semantics, and source fields.       |
| Issue detail         | `GET /api/issues/:owner/:repo/:number`                       | Detail route                                     | Preserve owner/repository/number identity and Gitea URL.                         |
| Issue edit           | `PATCH /api/issues/:owner/:repo/:number`                     | Edit form, state/assignee/labels/milestone       | Send the existing payload shape and show server failures.                        |
| Issue create         | `POST /api/repositories/:owner/:repo/issues`                 | Create form                                      | Keep selected Repository and supported Gitea Issue fields.                       |
| Comments             | `GET/POST /api/issues/:owner/:repo/:number/comments`         | Comment thread/composer                          | Keep author, body, time, and mutation result semantics.                          |
| Boards               | `GET/POST /api/boards`                                       | Board list/create                                | Do not introduce client-only Boards.                                             |
| Board detail         | `GET/PATCH/DELETE /api/boards/:id`                           | Board editor                                     | Preserve Board JSON-backed configuration and validation errors.                  |
| Card transition      | `POST /api/boards/:id/cards/:owner/:repo/:number/transition` | Drag or keyboard Kanban move                     | The transition must persist through the existing Gitea-supported workflow state. |

## Request invariants

1. Requests continue to use same-origin credentials and the existing CSRF header behavior.
2. A successful-looking UI state is not shown until the existing mutation resolves successfully.
3. A failed or forbidden request remains visible as an actionable error and does not bypass Gitea permissions.
4. The UI must keep a direct link to the original Gitea Issue wherever an Issue is presented in detail or as a Board card.
5. No Issue, Comment, Label, Milestone, Board, or Workflow state is persisted by a new browser-side store.
6. Existing loading, empty, error, and permission states remain reachable through the new components.

## Component contract

The replacement components must preserve the information needed by the current feature behavior:

- Issue row/card: Repository, number, title, state, assignee, labels, milestone when present, updated time, and Gitea link.
- Issue detail: title, description, state controls, assignee, labels, milestone, comments, comment composer, and mutation feedback.
- Kanban card: Repository, number, title, assignee, labels, direct Gitea link, and keyboard alternative to pointer dragging.
- Filters/forms: visible labels, stable field names, validation/error association, and disabled/pending states.
