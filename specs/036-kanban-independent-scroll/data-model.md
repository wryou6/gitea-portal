# Data Model: Kanban 欄位獨立捲動

This feature changes presentation only. It adds no persisted data, API fields, or Gitea entities.

## Presentation entities

### Kanban column

Represents one existing fixed Issue Status grouping or the existing Anomaly grouping.

| Attribute | Source | Constraint |
|-----------|--------|------------|
| State key | Existing Kanban view data | Unchanged; identifies the column and its existing transition behavior. |
| Display heading | Existing translated status presenter | Remains visible while its cards scroll; also names the card-list region. |
| Card list | Existing column cards | Scrolls vertically within its own column. |

### Kanban card

Represents an Issue already returned by the authorized Gitea read-through view. Its identity, fields, ownership, state, and persistence are unchanged. Scrolling does not read or write Issue data.

## Relationships

- A Kanban column contains zero or more cards.
- Each rendered card list belongs to exactly one status or anomaly column and has an accessible name associated with that column heading.
