# Data Model: Workflow Default State Repair

## Persistence boundary

本 feature 不新增持久化 Entity。Board 設定仍由既有 JSON store 保存，Issue、Workflow Labels、Issue 狀態與 Comments 仍全部由 Gitea 保存。以下 `Board Card` 與 `Workflow Repair Result` 都是 Board load 時建立的 read-time view data；Portal 不保存它們的 snapshot 或 repair history。

## Workflow Convention

| Field | Rule |
|---|---|
| `id` | Convention identity；Board 以 `id + version` 精確選取 |
| `version` | Convention version；不可與 Board 選取的版本混用 |
| `states[]` | 至少一個 Workflow State |
| `states[].key` | 同一 Convention 內唯一 |
| `states[].labelName` | 同一 Convention 內唯一，且是 Gitea Repository 中應存在的 Label 名稱 |
| `states[].displayName` | Board 欄位顯示文字 |
| `states[].order` | 非負且唯一；最小值代表 default state |

## Workflow State

Workflow State 是 Convention 對一個 Gitea Label 的定義：

```text
key         -> Board column identity
labelName   -> Gitea persisted label
displayName -> user-facing column name
order       -> display order and default-state selection
```

Portal 不新增獨立的 state 欄位；Board 狀態改變必須反映為 Gitea Issue 上的 Workflow Label。

## Board

Board 是既有 JSON persisted configuration：

- `id`, `name`
- `repositoryRefs[]`
- `workflowConventionId`, `workflowConventionVersion`
- `createdAt`, `updatedAt`

本 feature 不修改 Board schema，不加入 `defaultStateKey`、owner、member、repair result 或 Issue snapshot。

## Board Card

Board Card 代表真實 Gitea Issue，沿用既有 identity 與 Issue summary 欄位：

- Repository owner/name 與 Issue number
- title、open/closed state、assignee、labels、milestone、updated time、Gitea URL
- `workflowState`: 有效 state key，或 `unconfigured` / `conflict`
- `workflowRepair`: 可選的本次 Board load repair annotation，不持久化

建議的 `workflowRepair` view shape：

```text
{
  outcome: "repaired" | "failed",
  sourceState: "unconfigured" | "conflict",
  targetStateKey?: string,
  errorCode?: "permission_denied" | "missing_label" | "concurrent_change" |
              "external_unavailable" | "persist_failed" | "unknown",
  message?: string
}
```

規則：

- `repaired` 必須只在 Gitea replacement 成功且重新讀取的 Issue 符合目標 Label 後回傳。
- `failed` 不得帶著假造的 target state；Card 的 `workflowState` 必須仍是原本 anomaly。
- `failed` 應包含可理解的 `errorCode` 與 message；不得把敏感 token、內部 credential 或完整外部回應直接暴露給 UI。
- 若 Gitea 因並行修改或外部錯誤無法取得更新資料，顯示已讀到的真實資料並附錯誤；下一次載入必須重新讀取 Gitea。

## Workflow Repair Result

每個 anomaly Card 產生一個暫時結果：

1. 讀取目前 Issue 與 Repository labels。
2. 判斷 `unconfigured` 或 `conflict`。
3. 以 Convention 最小 `order` state 作為 target。
4. 確認使用者有該 Repository 的 label modification permission。
5. 確認 target Label 已存在，保留非 Workflow Labels。
6. 以原始 `updatedAt` 與 label names 做 preflight。
7. 一次 replacement 寫回 Gitea。
8. 成功後重新讀取 Issue 並驗證結果；失敗則保留 anomaly。

Board load 的錯誤邊界：

- 若 Board 所需的 Issue 或 Repository 資料讀取失敗，沒有可建立的 Board Card，整個 Board view 以外部服務錯誤結束。
- 若 Issue 已成功讀取，只有後續 Label permission、target Label、preflight、replacement 或 verification 失敗，則建立 `failed` result，保留該 Card 的 anomaly，其他 Card 照常完成。
- `external_unavailable` 只有在 Issue 已讀取後的單 Card 修復流程失敗時使用；初始 Board data read failure 不轉成 Card annotation。

## State transitions

```text
unconfigured --auto repair success--> default state
conflict     --auto repair success--> default state
unconfigured --auto repair failure--> unconfigured + failed annotation
conflict     --auto repair failure--> conflict + failed annotation
anomaly      --manual drag success--> selected valid state
anomaly      --manual drag failure--> same anomaly + failed annotation
valid state  --manual drag success--> selected valid state
```

任何 transition 都不能建立 Portal-only 狀態。一般 Labels 不參與 anomaly 判定，也不能因修復被移除。

## Board columns

- Convention states 依 `order` 排列，即使沒有 Card 仍保留。
- `unconfigured` 與 `conflict` 是 anomaly columns；只有仍有對應 Card 時才回傳/顯示。
- 成功修復後的 Card 進入 default column；失敗 Card 留在對應 anomaly column。
- Board load 從開始讀取到 repaired/failed 結果可辨識的 elapsed time，應在 quickstart dummy data 驗證中不超過 3 秒。
