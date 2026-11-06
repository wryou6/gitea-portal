# Assignee Avatar Group Contract

## Visual order

1. Main person: existing-size avatar followed by display name.
2. Up to two additional handlers: 16px avatars immediately after the main name, in Gitea assignee order.
3. If additional handlers remain hidden, render `+N` after the visible avatars, where N is the exact remaining count.
4. A single person uses the existing `UserIdentity` presentation without extra avatars or a count.
5. No assignee uses the existing localized unassigned presentation.

## Identity semantics

- Open Issues use `currentOwner` as primary and the existing fallback when it is absent.
- Done Issues use the first retained Gitea assignee as primary; never describe the person as a current owner.
- Remove duplicate logins while preserving the first occurrence and Gitea ordering.
- Names and logins identify people; avatars are visual cues and do not replace identity text.

## Accessibility and responsive behavior

- The people group is a single keyboard-focusable group with a localized accessible name containing every person's display name and login in order.
- Hover title exposes the same complete ordered people list. Decorative secondary images and `+N` do not add duplicate screen-reader announcements.
- Missing or failed images use the standard default avatar without changing the reserved size.
- Extra avatar count is capped, keeping Issue List, Kanban and Gantt widths bounded. Long content must not overlap Status, due date or timeline controls; Gantt header and row measurements remain aligned.

## Data boundary

- Read only `assignee`, `currentOwner`, ordered `assignees`, and `userProfiles` already in the Issue response.
- Do not add network requests, Gitea writes, Portal persistence, or changes to filters, sorting, transitions, or assignee order.
