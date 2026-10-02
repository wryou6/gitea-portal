# Issue List Read Contract

## `GET /api/issues`

This existing Portal endpoint returns every Issue matching the request, in the requested sort order. It remains read-only and uses the current user's Gitea authorization.

### Query

Existing search, repository, status, assignee, priority, type, milestone, label, sort, and direction filters remain supported. `page` and `limit` are no longer used to select a subset. A legacy `page` query parameter is ignored so old links still open the complete list.

### Response

The response contains the complete `items` array and no pagination metadata (`page`, `limit`, or `hasNext`). Each item includes `closedAt`, sourced from Gitea `closed_at` and nullable when no timestamp is available.

### Completeness and failures

The endpoint aggregates all Gitea pages for all repositories in scope before returning a result. If a required repository or page read fails, the request fails as a whole; the endpoint must not return a partial list as complete.

## Work-view control behavior

Issues List, Kanban, and Gantt expose an accessible, localized checkbox in the left control panel. It defaults to checked on each page entry, is not serialized to the URL or account preferences, and updates the visible result and upper-left summary immediately. The summary includes the result count and, while checked, “Completed: last 30 days”. It filters only Done items based on their local calendar `closedAt` date; unchecking includes all Done items and removes the date condition from the summary.
