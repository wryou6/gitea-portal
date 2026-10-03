# Contract: Portal 站內導航

## Internal navigation

- A same-origin Portal destination updates the visible page and browser URL without loading a new document.
- The shared AppShell remains present during route transitions; page-specific loading, empty, and error states remain inside its content area.
- Standard anchor behaviors remain available: keyboard activation, modifier-click, middle-click, and opening in a new tab.
- Browser Back and Forward restore both the destination and its URL-backed state.

## URL state

- Use the existing route builders, `safeReturnTo`, and work-view URL utilities to create and validate destinations.
- Keep shared work-view filters portable across List, Kanban, and Gantt; keep `gantt_start`/`gantt_scale` Gantt-only; keep `sort`/`direction` List-only with the existing List-to-List rule.
- Issue detail/create destinations preserve a validated `returnTo`; Gantt-origin Issue returns restore the original Gantt URL state.
- List filter/sort edits and Kanban filter edits create history entries; Gantt preference URL synchronization retains its existing replace semantics.

## Full document navigation

- OAuth sign-in/callback/logout and external Gitea destinations retain full-document navigation.
- Direct opening or refreshing a supported Portal URL serves the Web application entry document; `/api`, `/auth`, and static asset paths retain their current server routing.
