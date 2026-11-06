# Research: 工作檢視共用篩選與全域搜尋

## Decision 1: Reuse current workspace view routes and query state

- **Decision**: Keep shared filter values in the current view URL and preserve those values while navigating among List, Kanban, and Gantt in the same workspace. Omit default values and discard invalid enum values.
- **Rationale**: The Issue List already reads and writes filters, sort, and pagination through query parameters. Gantt already preserves its date range and scale in the URL. The browser URL is shareable and avoids introducing Portal persistence.
- **Alternatives considered**: Cookie/local storage was rejected because the user explicitly chose shareable URLs; a new saved-filter entity was rejected because it adds persistence and is outside scope.

## Decision 2: Match the complete set before List pagination

- **Decision**: Add priority and Issue Type to the existing read-through `/api/issues` filtering, before pagination. Continue applying existing repository, assignee, Status, Label, and Milestone constraints in that query flow.
- **Rationale**: The current issue search service already loads all issues in the requested scope, applies Portal-side filters, sorts, and only then slices a page of up to 50. Filtering only the visible page would produce incomplete results.
- **Alternatives considered**: Filtering the current page in the browser was rejected because it would omit matches from later pages; changing Gitea endpoints is unnecessary because required attributes are already present in the normalized Issue data.

## Decision 3: Use a shared matcher for complete Kanban/Gantt datasets

- **Decision**: Apply the same filter semantics to all loaded Kanban cards and Gantt Issues in the web layer; keep zero-card status columns and preserve anomaly visibility when Status is unfiltered.
- **Rationale**: Existing aggregate work-view endpoints return complete Issue sets for the workspace, and Gitea must remain the data source. A shared predicate prevents the same filter from behaving differently in the three views.
- **Alternatives considered**: Adding query parameters to aggregate APIs was rejected for the first release because these endpoints already load the full collection and filtering does not require a contract change there.

## Decision 4: Search from the top bar across all readable repositories

- **Decision**: Promote the existing title/body/number keyword match to an authenticated top-bar autocomplete. Search always spans all repositories readable by the delegated user; a selected result opens its Issue detail and retains the originating page as the return target.
- **Rationale**: This follows the user's decision that global search ignores the currently selected workspace and stays available from all authenticated pages. The existing read-through search already matches Issue title, body, number, and repository identity.
- **Alternatives considered**: Search limited to the selected repository was rejected by clarification. Navigating immediately to the Issue List on submit was rejected by clarification in favor of an in-place result dropdown.

## Decision 5: Replace Gantt's duplicate state and assignee controls

- **Decision**: Remove Gantt Open/Closed and standalone Assignee controls. Use common Portal Status and Assignee controls; retain Gantt date range, scale, and display preferences.
- **Rationale**: Todo and In Progress map to Gitea Open, while Done maps to Gitea Closed. A second Gantt-only state control would duplicate the selected shared Status filter.
- **Alternatives considered**: Keeping both filters was rejected by clarification. Moving Gantt date/scale controls into the common filter bar was rejected because they control the timeline rather than the Issue result set.

## Decision 6: Do not add a new visual or data dependency

- **Decision**: Use the existing React, i18n, CSS tokens, UI primitives, and Storybook infrastructure.
- **Rationale**: The feature is a UI/data-flow change in an existing React/Vite workspace. Existing components already cover controlled fields, accessible buttons, loading/empty/error feedback, and story fixtures.
- **Alternatives considered**: Installing a third-party command palette or search library was rejected because it would add a dependency for a bounded autocomplete pattern.
