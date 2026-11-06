# Issue Schedule API Contract

All routes use the authenticated request's existing delegated Gitea identity. No service credential may be used to make a schedule write on the user's behalf.

## Issue reads

`GET /api/issues` and `GET /api/issues/{owner}/{repo}/{number}` include:

```json
{
  "startDate": "2026-09-26",
  "dueDate": "2026-10-03"
}
```

Both fields are nullable `YYYY-MM-DD` values. `labels` remains the complete set of Gitea labels.

## Issue create/update

`POST /api/repositories/{owner}/{repo}/issues` and `PATCH /api/issues/{owner}/{repo}/{number}` accept optional schedule fields:

```json
{
  "startDate": "2026-09-26",
  "dueDate": "2026-10-03"
}
```

- Missing field means leave that date unchanged on PATCH; explicit `null` clears that date.
- Dates must be real `YYYY-MM-DD` dates. Reject timestamps and invalid dates with HTTP 422.
- Gitea due date writes use its native `due_date` field; clearing uses the Gitea supported unset operation.
- Start date writes use `start-date:YYYY-MM-DD`; the API looks up or creates/reuses the Repository label definition under the current user's permission, then updates the Issue through checked atomic Label replacement and preserves Workflow/other labels.
- Clearing a start date removes the Issue's date label assignment but retains the Repository label definition. Generic label edits preserve the date Label; date inputs own its value.
- On permission, concurrency, external, or partial write failure, return a non-success response with an error and the actual refreshed Issue schedule when available. Never report unsaved values as saved.
- If both fields are sent, the API may observe a partial remote write because Gitea has no transaction spanning Issue PATCH and Label replacement. The response must identify actual persisted values.

## Label encoding

The confirmed Label format is `start-date:YYYY-MM-DD`. Implementations must not auto-delete unused Repository label definitions.
