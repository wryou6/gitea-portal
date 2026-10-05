# Research: Kanban 欄位獨立捲動

## Current behavior

- `apps/web/src/index.css` already fixes `.app-shell:has(.work-view-layout)` to `100dvh` and hides outer overflow.
- `.work-view-content` is shared by List and Kanban and uses `overflow: auto`; changing it globally would alter List behavior.
- `.kanban-board` currently handles horizontal scrolling only. Its columns have a minimum height but no bounded available height or internal card-list region.
- `KanbanColumn.tsx` renders the heading and cards as siblings. On narrow viewports, CSS stacks columns while `KanbanBoard.tsx` filters to a selected lane through the existing lane picker.
- At 390×844, the current top bar and four common filter groups consume most available height; the selected Kanban card-list region can collapse to effectively zero height unless filters start hidden.

## Decisions

### Keep page-level viewport containment and scope vertical overflow to columns

- **Decision**: Set a bounded flex height for the Kanban board within its existing work-view content area; disable vertical overflow on that Kanban content area only. Make each column a min-height-safe flex container, keep the heading outside the scroll region, and put the card list/empty message in its own vertically scrollable region.
- **Rationale**: This preserves the current app shell and prevents one column's wheel/touch scroll from moving the other columns. A Kanban-only selector avoids changing shared List/Gantt behavior.
- **Alternatives considered**: Making the whole board scroll vertically repeats the current coupling. Making the entire column scroll moves its heading out of view. Disabling overflow on all work views would regress List.

### Keep horizontal board browsing and the narrow-screen lane picker

- **Decision**: Preserve horizontal overflow for desktop layouts where all columns do not fit. On narrow layouts, continue to show the selected lane and constrain it to available board height so its card list scrolls internally.
- **Rationale**: This matches the user's confirmed viewport behavior and preserves current mobile navigation semantics.
- **Alternatives considered**: Stacking every lane vertically would require page-level vertical scrolling and change the established narrow-screen interaction.

### Collapse common filters by default on narrow Kanban

- **Decision**: At the existing narrow-screen breakpoint, Kanban starts with the four common filter groups collapsed behind an accessible, localized disclosure control. Users can expand them without losing selected filters. Desktop filters remain visible. Enable this only for Kanban through an opt-in on the shared work-view layout.
- **Rationale**: Browser measurement showed that expanded filters leave almost no height for the selected lane, defeating viewport-contained card scrolling. The disclosure preserves filter access while giving the board usable space.
- **Alternatives considered**: A separate vertical scroller for the filter groups adds a competing scroll surface. Allowing the page to scroll conflicts with the confirmed full-viewport requirement. Applying this change to all work views exceeds feature scope.

### Make the card-list region keyboard scrollable and named from its column

- **Decision**: Give the scroll region a programmatic name referencing the translated column heading, keyboard focusability, and visible focus treatment.
- **Rationale**: Native overflow regions are not consistently keyboard reachable unless made focusable; the existing heading supplies localized naming without adding translation strings.
- **Alternatives considered**: Making the entire column focusable does not clearly identify the scrollable region and couples keyboard scroll to drop-target semantics.

## No external dependencies

The change uses native CSS overflow and existing React markup. No API, storage, dependency, or Gitea write changes are needed. Only the disclosure labels are added to the existing zh-TW, English, and Japanese work-view resources.
