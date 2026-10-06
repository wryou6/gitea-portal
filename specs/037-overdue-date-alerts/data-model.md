# Data Model: 跨檢視逾期日期提示

This feature adds no persisted or API data. It derives a view-only status from the existing Issue and schedule fields.

## Issue inputs

| Field | Existing meaning | Use in this feature |
|---|---|---|
| `state` | Gitea Issue state: `open` or `closed` | Only `open` Issues may be overdue. |
| `dueDate` | Optional date-only value from Gitea | Must be a valid calendar date and strictly earlier than local today. |
| `scheduleAnomaly` | Existing schedule anomaly, when present | `invalid_due_date` and `date_range_reversed` suppress overdue; start-date-only anomalies do not suppress a valid overdue due date. |
| local today | Browser-local calendar date (`YYYY-MM-DD`) | Compared with a validated date-only due date; equality is not overdue. |

## Derived presentation state

`overdue = state === "open" && valid(dueDate) && dueDate < localToday && scheduleAnomaly not in {invalid_due_date, date_range_reversed}`

The result is transient UI state. It is not returned by the API, stored in Portal settings, or written to Gitea.

## Relationships

- The Issue remains owned by Gitea; this feature consumes its existing fields.
- Schedule anomaly presentation remains independent and may appear alongside overdue when only the start date is anomalous.
- The indicator uses the existing localized `issues.overdue` text and does not alter Issue status, ordering, or filter membership.
