# Research: 工作檢視網址參數範圍

## Decision: Apply explicit view-aware query state during navigation

Build destination URLs from the canonical route and an explicit allowlist: shared work-view filters are portable; Gantt date/scale are portable only from a Gantt source into a Gantt route or that Gantt route's Issue return target; List sort/direction are portable only when both source and destination are List. Do not copy arbitrary query keys between work views.

**Rationale**: The sidebar and workspace selector currently maintain overlapping key lists, while filter serialization starts from the existing query and can retain keys owned by another view. A single policy makes these route transitions consistent and makes obsolete parameters disappear at the next relevant URL update, while retaining List sorting for List destinations.

**Alternatives considered**:
- Keep Gantt date/scale across every view: rejected because those values have no meaning in List or Kanban and the user chose Gantt-only URL state.
- Store the last Gantt position separately: rejected because the user chose default Gantt values after ordinary navigation back; only Issue return flow restores the originating Gantt URL.
- Strip every query parameter on every route update: rejected because shared filters and List sort state have existing URL behavior, and Issue detail/create need `returnTo` and repository selection parameters.

## Decision: Retain Gantt state in explicit Issue return targets

Issue detail/create links originating from Gantt preserve the Gantt source URL, while links from List or Kanban do not add Gantt keys.

**Rationale**: This follows the clarified user flow and existing Issue return behavior without adding browser storage or a new state mechanism.

**Alternatives considered**:
- Return from Issue pages to defaults: rejected because it loses the user's current Gantt position and filters.
- Remember Gantt settings across ordinary view switches: rejected because ordinary view navigation must leave Gantt state behind.
