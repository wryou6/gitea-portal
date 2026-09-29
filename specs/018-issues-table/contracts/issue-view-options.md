# Issues View Options UI Contract

## Purpose

Define the account preference and visible behavior for the Issues table View Options. This is a Web UI contract; it adds no Portal or Gitea API.

## Preference shape

```ts
type IssueViewPreference = {
  version: 1;
  visibleFields: IssueSortField[];
  columnOrder: IssueSortField[];
  defaultSortField: IssueSortField;
  defaultSortDirection: "asc" | "desc";
};
```

- `columnOrder` is a complete permutation of the ten Issue sort fields.
- `visibleFields` is a subset of the ten fields and always contains `key` and `title`.
- The initial column order is `type, key, title, assignee, status, priority, startDate, dueDate, createdAt, author`.
- The initial sort is `key` ascending.
- Unknown versions, fields, duplicate/incomplete order, or invalid direction make the stored preference invalid; use the full initial preference rather than partially applying it.

## Cookie

- One cookie per authenticated Gitea login; its name is `gitea-portal-issue-view-<encodeURIComponent(login)>`.
- The value is URI-encoded JSON using the shape above.
- Use `Path=/`, `Max-Age=31536000`, `SameSite=Lax`, no `Domain`, and `Secure` only for HTTPS. Do not mark it `HttpOnly` because the Web UI reads and writes it.
- Do not save Issue data, access tokens, or other credentials. If login is unavailable, use defaults and do not write a cookie. If browser cookie access/write fails, keep the selected preference for the current visit.

## Load and update behavior

1. Resolve the account preference after the authenticated login is available.
2. A URL containing a valid `sort` and `direction` takes precedence over the saved default sort. Without both, initialize from the saved preference.
3. Dragging a table heading's text changes only the current rendered column order. It is discarded on navigation/reload until the user saves it as the default.
   - Do not render a dedicated drag button. Keyboard users focus the sortable heading button, press Shift+Space to pick it up, use Left/Right to move it, press Space to drop, or Escape to cancel; announce the current position.
4. View Options edits apply immediately to the current table and save the complete preference. Changing the default sort also updates the current query and URL to the selected sort/direction.
5. The table header and each row use the same visible field list and column order; empty-state cell span equals the visible column count.

## View Options interaction

- Right-aligned table actions place `Set as default column order` immediately left of `View Options` when the current order differs from the saved default.
- Clicking `Set as default column order` saves the current complete column order to the account cookie and hides the action once saved.
- A right-aligned `View Options` button above the table opens the existing accessible Dialog pattern.
- The first dialog view is a two-entry menu for field visibility and one default sort field with direction; selecting an entry opens that setting view with a back action.
- Key and Title visibility controls remain checked and disabled.
- The dialog does not edit property order.
- Reordering uses a short FLIP transition, highlights the drop target, and respects `prefers-reduced-motion`.
- The dialog is scrollable within a narrow viewport; close/Escape remains reachable and focus is not obscured.
- Closing with Escape or the close button returns focus to the View Options trigger.
- All new visible and accessible text is localized in zh-TW, en, and ja. Reuse existing table/Gitea wording where the meaning matches.

## Storybook

- Use injected preference fixtures and demo callbacks; stories MUST NOT read/write browser cookies or issue live API requests.
- Cover initial defaults, hidden fields, customized order and sort, the View Options menu and subviews, changed/saved default-order toolbar state, heading-text drag and keyboard reorder, and a narrow viewport.
