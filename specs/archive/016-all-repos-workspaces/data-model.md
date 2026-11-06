# Data Model: Repository 與 All repos 工作區

## Workspace scope

- **All repos**: request-time scope derived from the signed-in user's Gitea readable repository list. It stores no repository selection, Issue snapshot, or server-side membership.
- **Repository workspace**: one Gitea repository identity (`owner`, `name`, `fullName`) currently readable to the user.
- **View**: `issues`, `kanban`, or `gantt`; route determines the selected scope and view so a reload/share retains context.

## Issue identity and list result

- **Identity**: `(owner, name, number)`. Issue number alone is not unique across the aggregate.
- **Source fields**: Gitea Issue state, Labels, assignees, milestone, timestamps, and dates remain Gitea sourced.
- **Aggregate Issue page**: `items`, `page`, `limit`, `hasNext`; query filters are applied across the full readable Repository scope before global ordering and pagination.
- **Ordering**: `updatedAt` descending, then `owner`, `name`, `number` ascending for deterministic ties.

## Kanban view

- **Columns**: fixed workflow states plus an anomaly column when needed; each card retains Issue identity and complete Labels, with only presentation `visibleLabels` omitting workflow/action Labels.
- **Transition**: targets one Issue in one Repository. Validate the current fixed workflow action and user Gitea permissions, preserve unrelated Labels, use atomic replacement and expected update timestamp, and retain existing conflict/recovery semantics.

## Gantt view

- **Issues**: all pages from the selected Repository or every readable Repository for All repos.
- **Schedule**: derived from existing Gitea start-date Labels and native due dates; no Portal schedule persistence.
- **Display identity**: every aggregated row retains Repository owner/name and Issue number.

## Failure and empty states

- **No readable repositories / no issues**: show an empty state; do not fabricate a scope.
- **Required repository/page read fails**: fail the complete All repos result; never return partial data as complete.
- **Unknown route**: not-found state; no special handling of retired Board URLs.

## Persistence retirement

- No Board or Issue entity is persisted by this feature.
- Remove Board JSON store/config and its existing configured data/lock/temp files as authorized; no migration, export, or compatibility data model remains.
