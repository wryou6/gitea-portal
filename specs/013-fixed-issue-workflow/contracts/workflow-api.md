# Workflow API Contract

本文件描述 Portal 與其 Web UI 的內部 API。所有 Gitea 操作仍以目前使用者 token 執行。

## `GET /api/workflow-definition`

回傳固定狀態與原因定義，不讀取 Repository 設定。

```json
{
  "states": [
    {
      "key": "todo",
      "displayName": "待辦",
      "labelName": "workflow:todo",
      "order": 0
    },
    {
      "key": "in-progress",
      "displayName": "處理中",
      "labelName": "workflow:in-progress",
      "order": 1
    },
    { "key": "done", "displayName": "已完成", "labelName": null, "order": 2 }
  ],
  "actions": [
    {
      "key": "start-work",
      "fromState": "todo",
      "toState": "in-progress",
      "reasonLabel": "開始處理",
      "nextAction": "開始實作",
      "assigneePolicy": "require-if-unassigned"
    }
  ]
}
```

`actions` 必須包含 spec 中 24 項定義，不接受客戶端自訂動作。

## Issue summary/detail

既有 Issue payload 增加/改用以下欄位：

```json
{
  "state": "open",
  "workflowState": "todo",
  "labels": [{ "name": "workflow:todo" }],
  "assignees": ["jack", "peter"],
  "currentOwner": "jack",
  "lastActionKey": "clarify-requirements",
  "nextAction": "釐清需求"
}
```

`assignee` 單值欄位退場；`assignees` 順序依 Gitea 回傳。Closed Issue 的 `currentOwner` 固定為 null。`workflowState` anomaly 透過既有 anomaly/error representation 表達，不能猜測。

## `POST /api/repositories/:owner/:repo/issues`

Portal 建立的 Issue 必須寫入 `workflow:todo`，並以 Gitea Open 狀態建立；不得要求使用者先選 Convention 或 workflow state。初始不寫入 action Label，建立成功的 response 顯示 Todo，下一步依 Assignees 是否存在決定。

## `POST /api/issues/:owner/:repo/:number/transition`

執行一個已定義原因的狀態轉換。

Request:

```json
{
  "actionKey": "submit-for-review",
  "selectedAssignee": "reviewer-login",
  "expectedUpdatedAt": "2026-09-27T10:30:00Z"
}
```

`selectedAssignee` 只在明確改派、尚無 Assignee 開始處理時必要；送交審查時可選。除送審與必要指派外，保留目前第一位 Assignee。Action 定義和 request 的 fromState 必須符合目前最新 Issue，不提供 `targetState` 以免客戶端繞過原因規則。

Success: 回傳最新 Issue summary/detail。

Errors:

- `403`: 目前使用者無 Gitea 操作權限。
- `404`: Repository 或 Issue 不存在/不可見。
- `409`: `expectedUpdatedAt`、State、Labels 或 Assignees 已變更；要求重新載入。補償失敗時回傳當前實際 Issue snapshot/error detail。
- `422`: unknown action、來源狀態不合、必須指派但未選人、不可指派的 user，或固定 Label 缺失且無權建立。
- `502/504`: Gitea API unavailable/timeout；轉換不得呈現為成功。

## Existing resource contracts

- `GET /api/repositories`: remove `conventionId`/`conventionVersion`。
- `GET /api/workflow-conventions`: remove; replaced by `/api/workflow-definition`.
- `GET/POST/PATCH /api/boards`: Board JSON payload has no Convention ID/version; board Repository scope remains.
- `GET /api/repositories/:owner/:repo/kanban`, `GET /api/boards/:id`: fixed three columns, no convention/version response fields.
- Board Issue card may filter only `workflow:todo`, `workflow:in-progress`, `workflow-action:*` from its card-specific `visibleLabels`; issue list/detail return all Labels.

## Gitea API operations

- Read Issue including `assignees[]`, `state`, Labels and `updated_at`.
- Replace Label ID set in a single `PUT /repos/{owner}/{repo}/issues/{index}/labels` with pre-read and post-read checks.
- Reorder Assignees with two authenticated Issue updates: set `assignees: []`, then set the complete ordered array. If the second call fails, write back the original array and verify.
- Create fixed workflow Labels only when absent and caller has Label-management permission; otherwise return a clear permission/missing-label error.
- Use authenticated user's permission for Issue state, Label and Assignee changes; no elevated service token.
