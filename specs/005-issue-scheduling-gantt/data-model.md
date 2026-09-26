# Data Model: Issue 排程日期與甘特圖

## Gitea Issue Schedule

The schedule is a read-through view of fields stored on the canonical Gitea Issue; it is not an independently persisted Portal entity.

| Field | Type | Source | Rules |
|---|---|---|---|
| `startDate` | `YYYY-MM-DD \| null` | One dedicated Gitea Issue Label | Strict calendar date; zero means absent; exactly one valid start-date label is allowed |
| `dueDate` | `YYYY-MM-DD \| null` | Gitea Issue `due_date` | Convert Gitea RFC 3339 value to the same calendar date without local timezone shifting |
| `displayStartDate` | derived `YYYY-MM-DD \| null` | API/UI projection | Use `startDate`, otherwise `dueDate`; display-only |
| `displayEndDate` | derived `YYYY-MM-DD \| null` | API/UI projection | Use `dueDate`, otherwise `startDate`; display-only |
| `scheduleStatus` | `scheduled \| unscheduled \| invalid` | Derived | `unscheduled` when both source dates are absent; `invalid` for malformed/multiple start labels or start after due |

## Issue Identity and Relationships

- The Issue identity is `{ owner, name, number }`; `number` alone is not unique across Board repositories.
- A schedule belongs to exactly one Gitea Issue.
- An Issue belongs to one repository; repository label definitions are shared across Issues in that repository.
- A Board Gantt result contains only Issues from the Board's configured repository references that the current Gitea user can read.
- Gitea remains the owner of Issue state, assignees, labels, and due date. Board JSON stores no schedule fields.

## Label Parsing and Validation

- Canonical label name: `start-date:YYYY-MM-DD`.
- Parse only an exact prefix and a real Gregorian calendar date; reject strings that normalize to a different date.
- No matching label means `startDate = null`.
- More than one matching label, or a matching prefix with invalid date text, yields `scheduleStatus = invalid`; do not pick a value.
- If the date definition is absent, create/reuse it under the current user's Gitea permissions. When changing the start date, preserve all workflow and non-schedule labels. Remove only the previous start-date label from this Issue and apply the selected value through atomic replacement.
- Clearing an Issue's start date does not delete its now-unused Repository label definition. Generic Labels editing must preserve the current date label; the date field owns date-label mutation.
- Dates are calendar dates, not instants. Derived single-day display values never write back to Gitea.
- The prefix and definition lifecycle were confirmed in clarification session `2026-09-26`.

## Gantt Projection

`BoardGanttIssue` extends the shared Issue summary with its source/derived schedule fields. A valid pair `startDate <= dueDate` creates a date range. A single source date creates a one-day range at that date. No source dates create an unscheduled row without a bar. Invalid dates create an anomaly row without a valid range. Every row also retains repository owner/name, issue number, title, state, assignee, and Gitea URL.
