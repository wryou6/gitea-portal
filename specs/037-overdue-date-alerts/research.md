# Research: 跨檢視逾期日期提示

## Decision 1: Use one shared overdue rule

- **Decision**: Derive overdue from `Issue.state === "open"`, a valid calendar `dueDate`, no `invalid_due_date` or `date_range_reversed` anomaly, and `dueDate < today` using browser-local calendar date. Pass the existing Gantt `today` value into the predicate so the timeline and alert use the same day.
- **Rationale**: `IssueRow` already uses open state and a strict earlier-than-today comparison. Gantt already derives a browser-local calendar date. Sharing one predicate removes view-specific policy drift and preserves date-only semantics.
- **Alternatives considered**: Reimplement the comparison in each component (risks drift); compare timestamps (can shift a date-only due date across timezone boundaries); infer completion from workflow labels (conflicts with Gitea Open/Closed state).

## Decision 2: Use a consistent, icon-only overdue marker

- **Decision**: Extract the fire icon into a reusable, larger filled silhouette with an inner flame cutout, a danger-tinted circular background, and a border. Place it beside due dates in Issue List, Kanban, and Issue detail, and beside the title in Gantt. Keep the translated accessible name for zh-TW, en, and the existing third locale, without visible text.
- **Rationale**: Linear documents a red due-date icon for issues due today or overdue, with hover details for the date and elapsed days. Atlassian Jira's calendar uses red to identify work that was not completed before its due date. Follow the visual cue with a clearer flame silhouette and circular frame; Gantt keeps it compact instead of coloring the whole row, preserving schedule anomaly and status cues.
- **Alternatives considered**: Small unframed fire icon (too subtle and hard to recognize); visible text label (not the desired UI); duplicate SVG and screen-reader markup (risks inconsistent fixes); recolor entire Gantt rows (competes with schedule anomalies and status cues).

## Decision 3: Keep this feature presentation-only

- **Decision**: Do not add API fields, persistence, Gitea writes, sorting, filtering, or a midnight timer. Re-evaluate against the local date whenever the view renders or reloads.
- **Rationale**: The due date and Issue state are already present in each view's Issue data. The approved scope treats overdue as a derived visual cue and explicitly retains existing list behavior.
- **Alternatives considered**: Persist an overdue flag (can become stale); add a timer (adds lifecycle behavior outside the confirmed scope); automatically reorder Issues (changes established work-view behavior).

## Existing Evidence

- `apps/web/src/features/issues/IssueRow.tsx` currently computes the open-and-past-due condition and renders the fire icon.
- `apps/web/src/features/issues/ScheduleDates.tsx` renders due dates for the detail header and Kanban card but does not know Issue state.
- `apps/web/src/features/work-views/GanttBoard.tsx` obtains the current browser-local calendar day through `gantt-timeline.ts` and passes it to each `GanttIssueRow`.
- `apps/web/src/i18n/resources/issues.ts` already has an `overdue` translation in each supported locale.

## Product References

- Linear, [Due dates](https://linear.app/docs/due-dates): documents red due-date icons for issues due today or overdue and hover details showing the date and days remaining or passed.
- Atlassian, [Manage work items in your calendar](https://support.atlassian.com/jira-software-cloud/docs/manage-issues-in-your-calendar/): documents red calendar work items as overdue when they were not completed before the due date.
