# Gitea Issue Portal Design System

## Product direction

An internal engineering Issue workspace for cross-Repository scanning, triage, editing, commenting, and Kanban work. The interface should feel like a dependable workbench: dense enough for daily use, calm enough for long sessions, and explicit about Repository identity and Gitea authority.

## Visual direction

**Style**: Minimalism & Swiss with an engineering-workspace density.

- Use a strong grid, compact but readable rows, neutral surfaces, clear dividers, and restrained semantic accents.
- Support light and dark themes through the same semantic tokens; do not hard-code theme-specific colors inside feature components.
- Do not use broad glassmorphism, decorative gradients, excessive shadows, or emoji as UI icons.
- Use one consistent SVG icon family and pair icons with accessible names/tooltips when the icon is not self-evident.
- Keep the Repository name and Issue number visually prominent enough to remove cross-Repository ambiguity.

## Tokens

Use CSS variables with Tailwind semantic aliases.

| Category    | Guidance                                                                                           |
| ----------- | -------------------------------------------------------------------------------------------------- |
| Spacing     | 4px base rhythm with 8px preferred section increments.                                             |
| Typography  | 16px base body text, 1.5 line height, stronger weight/size for Issue titles and page headings.     |
| Surfaces    | Page, panel, elevated panel, muted panel, border, and input surfaces.                              |
| Content     | Primary, secondary, muted, inverse, disabled.                                                      |
| Actions     | Primary, secondary, destructive, focus ring.                                                       |
| Status      | Open, closed, success, warning, error, info, permission. State must not be encoded by color alone. |
| Radius      | Small consistent control radius; avoid excessive rounded cards.                                    |
| Motion      | Short opacity/transform transitions only; honor `prefers-reduced-motion`.                          |
| Breakpoints | Validate at 375, 768, 1024, and 1440 CSS pixels.                                                   |

## Component rules

- Prefer semantic HTML (`main`, `nav`, `section`, `table`, `form`, headings) before styling.
- Every form control has a visible label or an explicit accessible name; validation text is associated with the control.
- Every interactive control has a visible focus ring and a predictable keyboard order.
- Tables use semantic headers and row/cell structure; dense data remains scannable without relying on hover.
- Dialogs and sheets trap/restore focus correctly and expose a clear close action.
- Loading states use skeletons or progress indicators; empty states explain the next action; errors are actionable and announced where appropriate.
- Kanban drag-and-drop has a keyboard alternative that can choose a destination column and commit the same transition.
- Cards retain a direct Gitea link and never hide Repository identity.

## Page composition

- **Issue list**: page header and primary action, filter toolbar, active-filter summary, dense table/list, pagination or result status, and clear loading/empty/error states.
- **Issue detail**: Repository/number breadcrumb, title/state header, metadata controls, description, comments, composer, and original Gitea link.
- **Issue create/edit**: grouped fields with visible labels, server validation near the relevant field, and pending/disabled submit state.
- **Board list/editor**: Board identity and Workflow Convention context, compatible Repository picker, validation feedback, and entry to Kanban.
- **Kanban**: columns follow the selected Convention order; cards show Repository, Issue number, title, assignee, and labels without repeating the workflow label as a redundant card badge.

## Chart rules

Chart.js is a foundation only in this feature. When used later:

- Use line charts for time trends and bar charts for categorical comparisons.
- Provide a visible legend, useful tooltip text, a textual summary, and a table or keyboard-readable fallback.
- Do not use color as the sole encoding for open/closed, priority, or workflow state.
- Lazy-load chart code for routes that need it.
