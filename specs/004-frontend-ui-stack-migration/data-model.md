# Data Model: Frontend UI Stack Migration

## Persistence boundary

This feature adds no persisted entity. Issues, Comments, Labels, Milestones, Assignees, Workflow Labels, Boards, and Board membership remain owned by Gitea and the existing API/Board JSON implementation. The browser renders API responses and sends mutations through the existing request boundary.

## UI Component State

Shared components expose presentation state rather than domain persistence:

| Field            | Meaning                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| `name`           | Stable component identity used by stories and selectors.                                          |
| `variant`        | Visual role such as `default`, `destructive`, `outline`, or `ghost`.                              |
| `state`          | `default`, `hover`, `focus`, `disabled`, `loading`, `success`, `error`, `empty`, or `permission`. |
| `accessibleName` | Visible label or accessible name required for keyboard and assistive technology use.              |

Every state is derived from current props, route state, or API request state. It is not written to local or server persistence.

## Portal Page View State

Supported routes remain:

- `/` — cross-Repository Issue list and filters.
- `/issue/new` — Issue creation form.
- `/issue/:owner/:repo/:number` — Issue detail, edit, and comments.
- `/boards` — Board list.
- `/boards/:id` — Board editor and Kanban board.

Route components continue to consume the existing API client. A route may have `loading`, `error`, `empty`, `ready`, or `permission-denied` presentation states, but a refresh must re-read authoritative data from the API.

## Issue View State

Issue views preserve the existing domain fields:

- Identity: Repository owner/name, Issue number, Gitea URL.
- Content: title, description, state, updated time.
- Work metadata: assignee, labels, milestone, workflow display state.
- Collaboration: comments and comment composer state.
- Request state: initial loading, mutation pending, mutation success, mutation error, and permission failure.

The UI may optimistically disable controls while a mutation is pending, but it must not invent an Issue state when the API rejects a mutation. The authoritative response remains the source for the next rendered state.

## Board View State

Board views preserve the existing Board model and add no fields:

- Board identity and name.
- Selected Workflow Convention.
- Compatible Repository configuration.
- Ordered workflow columns from the Convention.
- Cards identified by real `{owner, repo, number}` Issue references.
- Drag/keyboard transition state and mutation feedback.

Moving a card calls the existing transition endpoint. The resulting Issue Workflow Label is the persisted work state; the Board does not store a second card status. Cards with missing or conflicting workflow metadata follow the current backend/domain normalization rules and are displayed using the returned state.

## Design Token Set

The new presentation layer defines semantic tokens for:

- Surfaces: page, panel, elevated panel, muted panel, border.
- Content: primary, secondary, muted, inverse, disabled.
- Actions: primary, secondary, destructive, focus ring.
- Status: open, closed, success, warning, error, info, permission.
- Layout: spacing scale, radius, control heights, responsive breakpoints, content max width.
- Motion: short interaction transition, panel transition, reduced-motion override.

Tokens are CSS variables consumed by Tailwind and source-owned UI components. They do not represent business data.

## Storybook Showcase State

Story fixtures use sanitized dummy values only. They must demonstrate long titles, multiple labels, missing assignee/milestone, loading, empty, error, permission-limited, narrow viewport, and keyboard-accessible interaction states without embedding real credentials, repository data, or operational Issue content.
