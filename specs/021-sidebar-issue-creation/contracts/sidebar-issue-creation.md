# UI Contract: Sidebar Issue Creation

## Entry

- Authenticated Portal pages display one `建立問題` action in the global sidebar.
- The action appears before the Issues navigation item and uses a plus icon consistent with the existing stroke icon set.
- The Issues list item is labeled `問題清單` in zh-TW, `Issue list` in English, and `課題一覧` in Japanese, keeping it distinct from the create action.
- Expanded mode shows the localized label; collapsed mode preserves the accessible name and existing tooltip behavior.
- On Issue creation routes, Create is the only current navigation item; the source Issues/Kanban/Gantt view is not simultaneously marked current. The workspace selector still preserves the source Repository context.

## Destination

- In a Repository workspace, the action opens the existing Repository-specific Issue create route with the current page as return context.
- In All repos or a page without Repository scope, the action opens the existing global Issue create route and preserves its current Repository selection behavior.
- Issue creation, authorization, cancellation, success, and failure behavior remain unchanged.

## Removed Entry

- The Issues page title area no longer renders its separate create action.
- Other Issue creation entry points that are not the Issues page title action are outside this change.

## Localization and Accessibility

- Global navigation label is supplied for `zh-TW`, `en`, and `ja` in the common locale resources.
- The action is a keyboard-operable link with an accessible label in both sidebar states.
