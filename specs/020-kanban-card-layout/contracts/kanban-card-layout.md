# Kanban Card Layout Contract

## Card information order

1. First row: Priority then Type badges on the left; Repository/Issue key (`owner/name #number`) aligned to the right.
2. Second row: Issue title only. Truncate a long title with an ellipsis while retaining its full text for assistive technology and its detail link.
3. Third row: Assignee on the left; Due date followed by the right-aligned Next action on the right. Render Due and Next as separate label/value groups with matching typography, spacing, and dividers; the Next label has no trailing colon. Do not label the assignee as current or last. Done issues show the first retained Gitea assignee; show "Not recorded" when the roster is empty. Allow the footer to wrap in narrow columns without overlap.
4. Do not render general Gitea Label chips that are not used by a card field. Keep complete Labels available in Issue list/detail; keep repair annotation and schedule anomaly details on the card.
5. Allow metadata to wrap in narrow columns without overlap.

Missing Type/Priority, unassigned owner, and unset Due date retain the existing localized missing-value presentation. Longer translated text may wrap without overlapping neighboring content or hiding card actions.

## Card order

- Todo, In Progress, and Anomaly cards sort by Priority (`critical`, `high`, `medium`, `low`, missing/conflicting last), then valid Due date ascending (no usable Due date last), then `updatedAt` ascending so the least recently updated work appears first.
- Done cards sort by `updatedAt` descending so the most recently completed work stays easiest to find. `updatedAt` is the available completion-time proxy.
- Equal sort values use Repository owner, Repository name, and Issue number as stable tie-breakers.

## Status action

- Cards have no Status action button or menu.
- Dragging a regular card to another Status opens the existing StatusTransitionDialog with applicable transition reasons and assignee options. The Issue is updated in Gitea only after the user confirms.
- Keyboard users can open the linked Issue title and use the existing Status action in Issue detail.
- Anomaly cards are not draggable and cannot receive drops. Existing authorization, atomic update, optimistic concurrency, error, and recovery behavior remain in force for valid Status transitions.

## Board layout

- On desktop, all visible columns divide the board's available inline space equally, including an Anomaly column when present.
- At the existing narrow-screen breakpoint, preserve the single selected column and lane picker.
- Do not change All repos or Repository data loading, Gantt, Issues list/detail, or Gitea contracts.
