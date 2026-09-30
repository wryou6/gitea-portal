# Data Model: Kanban 欄位與卡片版面調整

本功能只改變既有 Issue view 的呈現，不新增或修改持久化資料、domain entity 或 API shape。

## Existing view data

- **Kanban Card**：沿用 `WorkViewCard` 的 Issue；呈現 `type`、`priority`、`nextActionKey`、`title`、`owner`、`name`、`number`、目前／最後負責人、`dueDate` 及 schedule/repair annotations。一般 Gitea Labels 不作為卡片 chips 顯示。
- **Status destination**：沿用 Kanban columns 的 `stateKey` 和本地化 `displayName`。選擇目的地只開啟既有 StatusTransitionDialog，不在卡片元件直接寫入資料。
- **Card order**：只使用既有 Priority、Due date、`updatedAt`、Repository identity 與 Issue number 做回應期排序；不新增欄位、API contract 或 persistence。
- **Anomaly**：沿用 `stateKey: anomaly` 的唯讀異常欄；不得提供拖曳或 disclosure Status 目的地。

## Invariants

- Gitea 是 Issue、Label、Due date 與 Status 的唯一資料來源。
- Repository key 以 `owner/name #number` 識別，不以可能跨 repo 重複的 Issue number 單獨識別。
- Status transition 與原子 Label replacement、樂觀並行控制、權限及失敗回復行為維持現有 contract。
