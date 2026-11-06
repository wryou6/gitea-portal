# Research: 工作檢視多選篩選

## Decision 1: Represent multi-selection as repeated URL values

- **Decision**: Use repeated `priority`, `issueType`, and `state` query keys, one value for each selected option. Empty selection omits that key.
- **Rationale**: The existing filter state already lives in the URL and uses `URLSearchParams`; repeated keys are native, shareable, and can preserve existing single-value URLs.
- **Alternatives considered**: Comma-delimited values require escaping and an additional encoding convention; JSON query values are less readable and harder to maintain manually.

## Decision 2: Apply category OR and cross-category AND

- **Decision**: An Issue matches a category if its normalized value is one of the selected values. Every non-empty category and the existing assignee condition must match.
- **Rationale**: This matches the requested behavior and standard faceted-filter semantics. It keeps a user's choices additive within one dimension while intersections narrow across dimensions.
- **Alternatives considered**: AND within one category would require one Issue to have mutually exclusive priority/type/status values and would return no useful results.

## Decision 3: Treat “Unfinished” as a Status preset

- **Decision**: The shortcut replaces current Status selection with Todo and In Progress. Individual Status choices remain independently toggleable afterward. The shortcut appears selected whenever those two values are selected.
- **Rationale**: It matches the user's clarification that this button is a shortcut for forcing the non-completed statuses, not an additional filter dimension.
- **Alternatives considered**: Adding a fourth pseudo-status would duplicate the existing Status model and complicate matching, URL state, summaries, and clear behavior.

## Decision 4: Filter List results in the current complete read-through path

- **Decision**: Accept repeated query values in `/api/issues` and match them after reading the full authorized Issue set, before sorting and returning results. Kanban and Gantt keep using the shared client-side matcher.
- **Rationale**: The current API already gathers all pages from authorized repositories and filters the complete set. No upstream Gitea filter can directly express Portal Status labels as a multi-value facet.
- **Alternatives considered**: Fetching a separate result per value would duplicate repository reads and require de-duplication; mutating Gitea queries is unnecessary.

## Decision 5: Preserve invalid-value tolerance and localization

- **Decision**: Parse repeated values independently, discard invalid or duplicate values, and keep other valid selections. Add shortcut and accessibility text to zh-TW, en, and ja resources.
- **Rationale**: This retains current resilience to stale/manual URLs and follows the project localization and accessibility principles.
- **Alternatives considered**: Rejecting the full filter query when one value is invalid would discard usable conditions and depart from existing behavior.

## Decision 6: Keep each filter edit in browser history

- **Decision**: Every filter change creates a browser history entry. Browser back/forward restores that entry's filter selection and matching results in the current view.
- **Rationale**: The user explicitly chose stepwise restoration for each filter change. This also makes the URL a complete record of the visible filter state.
- **Alternatives considered**: Replacing the current history entry preserves the existing URL-update mechanism but cannot restore each prior filter change. Coalescing rapid edits would make some user actions unavailable to back/forward and was not requested.
