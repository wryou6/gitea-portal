# Contract: Board Workflow Repair

## `GET /api/boards/:id`

此 endpoint 仍是 Board view 的入口。回應前完成本次 Board load 觸發的所有 anomaly repair attempts。Board 所需 Issue/Repository data read failure 與單 Card repair failure 使用不同 response 行為。

### Success `200`

```json
{
  "board": {
    "id": "board-1",
    "name": "Team Board",
    "repositoryRefs": [{ "owner": "team", "name": "frontend" }],
    "workflowConventionId": "workflow-a",
    "workflowConventionVersion": "1"
  },
  "columns": [
    {
      "stateKey": "todo",
      "displayName": "Todo",
      "cards": [
        {
          "owner": "team",
          "name": "frontend",
          "number": 12,
          "title": "Example issue",
          "workflowState": "todo",
          "workflowRepair": {
            "outcome": "repaired",
            "sourceState": "unconfigured",
            "targetStateKey": "todo"
          }
        }
      ]
    },
    {
      "stateKey": "conflict",
      "displayName": "狀態衝突",
      "cards": [
        {
          "owner": "team",
          "name": "frontend",
          "number": 13,
          "title": "Repair failed",
          "workflowState": "conflict",
          "workflowRepair": {
            "outcome": "failed",
            "sourceState": "conflict",
            "errorCode": "permission_denied",
            "message": "沒有修改此 Repository Labels 的權限"
          }
        }
      ]
    }
  ]
}
```

Contract rules:

- `workflowRepair` is optional and exists only for the current Board load result.
- A successful repair card must be classified by the re-read Gitea labels, not by a Portal-only override.
- A failed repair card must retain `workflowState` as `unconfigured` or `conflict` and include an understandable error.
- A failure while initially reading the Board's required Issue or Repository data is not represented as a Card annotation; it returns the whole-Board external-service error instead.
- A failure after an Issue has been read successfully is represented as a per-Card annotation, and other successfully read Cards remain in the response.
- Empty `unconfigured` and `conflict` columns are omitted. Empty convention state columns remain.
- No Board owner/member or Issue snapshot fields are added.

### Error responses

| Status | Meaning |
|---|---|
| `401` | Current Gitea session is unavailable |
| `404` | Board does not exist |
| `422` | Board references an unavailable Workflow Convention |
| `502`/`504` | Gitea cannot provide required Board Issue/Repository data; no incomplete Board or repair success is returned |

## `POST /api/boards/:id/cards/:owner/:repo/:number/transition`

### Request

```json
{ "stateKey": "wip" }
```

`stateKey` must be a valid state in the Board's exact Workflow Convention. This operation is valid for normal and auto-repair-failed Cards.

### Success `200`

Returns the re-read Gitea Issue after label replacement. The returned Issue must contain exactly one Workflow Label from the Board Convention and preserve all non-Workflow Labels.

### Error responses

| Status | Meaning |
|---|---|
| `403` | User lacks Gitea Label modification permission |
| `404` | Board or Issue does not exist |
| `409` | Issue changed concurrently or Gitea did not persist requested labels; UI must retain/reload real state |
| `422` | `stateKey` is missing or not defined, or target Label is unavailable |
| `502`/`504` | Gitea unavailable; UI must not show a successful transition |

The transition uses the same permission check, current version/labels preflight, atomic replacement and post-write verification as automatic repair.
