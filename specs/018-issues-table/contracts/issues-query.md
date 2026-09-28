# Issues Query Contract

## `GET /api/issues`

### Query parameters

| Parameter | Values | Default |
|---|---|---|
| `q` | optional search string | empty |
| `repository` | optional `owner/repo` | all readable repositories |
| `state` | `all`, `open`, `closed`, `todo`, `in-progress`, `done` plus existing filters | `all` |
| `assignee`, `label`, `milestone` | existing filter syntax | unset |
| `sort` | `type`, `key`, `title`, `assignee`, `status`, `priority`, `createdAt`, `startDate`, `dueDate`, `author` | `key` |
| `direction` | `asc`, `desc` | `asc` |
| `page` | positive integer | `1` |
| `limit` | integer, effective range 1–50 | `50` |

The API filters then sorts the complete readable result before paging. Missing values remain after present values in either direction. Key ascending is used as deterministic tie-breaker. Any required repository or issue read failure fails the complete response.

### Response

```json
{
  "items": [],
  "page": 1,
  "limit": 50,
  "hasNext": false,
  "sort": "key",
  "direction": "asc"
}
```

Each item includes Gitea-native `createdAt` and `author` in addition to current Issue fields. Status is Portal's three-state projection (or explicit anomaly), distinct from native Gitea `state`.
