# Quickstart: Kanban 欄位獨立捲動

## Prerequisites

- Install workspace dependencies with `pnpm.cmd install` if needed.
- Start the local API and Web app with `pnpm.cmd dev`, or open the existing Kanban Storybook examples.
- Use data containing enough cards for at least two columns to exceed the visible height.

## Validation scenarios

1. **Desktop independent scroll**: Open All repos and a Repository Kanban. Scroll Todo, In Progress, Done and (when present) Anomaly separately. Confirm only the selected card list moves and each heading/count stays visible.
2. **Viewport containment**: Increase card count beyond the window height. Confirm the document/page does not scroll vertically and card content remains reachable in each column.
3. **Horizontal browsing**: Reduce desktop width until the board columns no longer fit. Confirm the board can move horizontally while page-level vertical scrolling stays disabled.
4. **Narrow viewport**: At or below the existing 720px breakpoint, confirm the four common filters start collapsed and the selected Kanban lane receives usable height. Expand the filters, change a condition, collapse and reopen them, and confirm the condition is retained. Switch the lane picker and scroll its selected lane without page scrolling.
5. **Keyboard and focus**: Tab to the mobile filter disclosure and each visible card-list region; confirm expanded state, visible focus, keyboard scrolling, and the assistive name corresponds to the translated column heading.
6. **Empty lane and drag/drop**: Confirm an empty lane message remains visible without an unnecessary scrollbar. Drag a card to another valid status and confirm the existing transition completes; Anomaly remains non-droppable as before.

## Automated project checks

Run from the repository root:

```powershell
pnpm.cmd typecheck
pnpm.cmd build
```

These checks complement the viewport and interaction scenarios above; they do not replace visual inspection of desktop and narrow layouts.
