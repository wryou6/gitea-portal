# Data Model: Issues 表格與 Status 統一

## Issue row

來源是 Gitea Issue，經 API mapping 提供以下欄位：

| 欄位 | 型別／來源 | 顯示與驗證規則 |
|---|---|---|
| Repository identity | `owner`, `name` | 保留來源大小寫；與 number 組成 Key。 |
| Key | `${owner}/${name}#${number}` | Table 導覽識別；預設升冪排序。 |
| Type | labels 衍生的 `IssueType` | 沿用現有 badge、缺漏與 anomaly 呈現。 |
| Title | Gitea `title` | Issue 詳情連結。 |
| Assignee | Gitea assignee(s) | 未指派依現有文案顯示；排序依登入名稱。 |
| Status | `todo | in-progress | done | anomaly` | Todo/In Progress 由 `status:` Label 解析，Done 由 Gitea Closed state 表示；異常保留可辨識呈現。 |
| Priority | priority label 衍生值 | 沿用既有四級順序及 badge。 |
| Created at | Gitea `created_at` | 原始 ISO 時間，不由更新時間替代。 |
| Start Date | `startDate` label 衍生日曆日期 | 以 `YYYY-MM-DD` 排序與顯示。 |
| Due Date | Gitea due date | 日曆日期；日期早於當地今日且 Issue 未關閉時才加逾期提示。 |
| Author | Gitea Issue `user` | 建立者 login/full name；不以 assignee 或更新者替代。 |
| Labels、Milestone、state | Gitea | 非表格主欄或 Status 衍生來源；不因排序或狀態遷移改動。 |

## Issue list query

- Filters: 現有 `q`, `repository`, native/Portal `state`, `assignee`, `label`, `milestone`。
- Sort field: `type | key | title | assignee | status | priority | createdAt | startDate | dueDate | author`。
- Direction: `asc | desc`。
- Defaults: `sort=key`, `direction=asc`, `page=1`, `limit=50`。
- Validation: 未知 sort/direction rejected as invalid query; page is at least 1; limit is clamped to 1–50.
- Ordering: null values last regardless of direction; selected field ordering then Key ascending deterministic tie-breaker.
- Pagination: filters and ordering run over the full query result before slicing; `hasNext` means at least one item remains after the page.

## Status label migration item

- Identity: `{ owner, repository, issueNumber }`。
- Source labels: exact known `workflow:todo`, `workflow:in-progress`, and `workflow-action:<known action key>` values.
- Target labels: corresponding `status:todo`, `status:in-progress`, `status-action:<same action key>` values.
- Unrelated labels: preserve exact Gitea label IDs/names.
- State: `unchanged | migrated | resolved-conflict | failed | conflict` for an individual attempt; a complete-scope rescan additionally returns `verified | incomplete`.
- Idempotency: re-reading an Issue with no legacy labels is unchanged; a retry operates on current labels and does not duplicate target labels.
- Precedence: if any target-prefix label already exists, keep target-prefix labels as authoritative and remove old-prefix labels even if the mapped values differ; report both values as `resolved-conflict`. Otherwise map known legacy values to new names.
- Failure: unknown legacy prefix/key, inability to resolve target label IDs, changed Issue version or verification mismatch cannot be treated as migrated.
- Atomicity: one Issue label set is replaced in one operation after optimistic check; there is no cross-Issue transaction. Partial progress remains visible and retryable.
