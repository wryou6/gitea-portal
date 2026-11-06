# Board Gantt API Contract

## Read Gantt data

`GET /api/boards/{id}/gantt` returns all Issues in the Board's Repository scope that the current Gitea user can read. The API reads every Gitea page for every configured Repository with `state=all`; the response is all-or-error and does not return partial results as complete.

```json
{
  "board": { "id": "board-id", "name": "Roadmap", "repositoryRefs": [] },
  "issues": [
    {
      "owner": "team",
      "name": "service",
      "number": 42,
      "title": "Example issue",
      "state": "open",
      "assignee": "alice",
      "startDate": "2026-09-26",
      "dueDate": "2026-10-03",
      "scheduleStatus": "scheduled",
      "htmlUrl": "https://gitea.example/team/service/issues/42"
    }
  ]
}
```

The response preserves each Issue's `{owner, name, number}` identity. Filter controls use assignee and Open/Closed state; default assignee is the current Gitea user and default state includes both values. The API response may contain all Board Issues so the UI can populate assignee choices and filter without losing issues.

## Derived display behavior

- Both valid dates: draw `[startDate, dueDate]`.
- One valid date: draw a one-day item at that date, without mutating Gitea.
- No dates: return under the UI's `未排程` section with no date bar.
- Invalid/multiple start-date labels or reversed range: return a recognizable anomaly state; do not draw a valid range.
- Any required Gitea Repository/page read failure returns an error response; no truncated success.

## UI interaction

The existing Board page provides a Kanban/Gantt toggle. Gantt issue links open the Portal Issue detail route. The Gantt provides keyboard-operable links and controls plus a narrow-screen issue/date list that does not require Canvas.
