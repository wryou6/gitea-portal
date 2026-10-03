# Data Model: 站內畫面切換不閃白

This feature adds no persisted data and no API entities. Navigation state remains in the current URL and browser history.

## Portal Location

| Field | Meaning |
|---|---|
| `pathname` | Current Portal destination; parsed by the existing route resolver. |
| `search` | Existing route-specific query state, including filters, List sorting, Gantt date/scale, repository selection, and Issue `returnTo`. |
| `hash` | Browser fragment when present; preserve as part of normal link navigation. |
| `state` | Optional transient browser-history state; no new feature data is stored here. |

## History Entry

Each user navigation or filter change follows existing push-versus-replace semantics. Browser POP navigation restores the corresponding URL-backed page state. No Issue, Gitea, or Portal persistence model changes.
