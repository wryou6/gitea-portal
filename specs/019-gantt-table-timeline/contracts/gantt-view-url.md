# Gantt View URL Contract

## Query parameters

| Parameter | Accepted values | Default | Behavior |
|---|---|---|---|
| `gantt_start` | Valid calendar date `YYYY-MM-DD` | Browser-local today minus 7 calendar days | Sets the initial horizontal date position, not a lower bound; users can scroll to earlier scheduled dates. |
| `gantt_scale` | `day`, `week`, `two-weeks`, `month` | `day` | Sets the displayed calendar interval and date header granularity. |

Missing or invalid values fall back independently to their defaults. Updating these parameters preserves other query values, including existing Gantt filters. Issue detail links created from Gantt preserve both parameters in their `returnTo` value.

This is a Web navigation contract only. It does not add or change an API endpoint or Gitea data contract.
