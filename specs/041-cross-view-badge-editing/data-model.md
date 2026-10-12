# Data Model: 三個工作檢視的 Badge 快速編輯

## Persisted Entities

本功能不新增 persisted entity 或欄位。Gitea Issue 仍是資料唯一來源，沿用既有 `Issue` read model：

| 欄位 | 用途 | 保存來源 |
|---|---|---|
| `owner`, `name`, `number` | 定位 Issue 與 Repository | Gitea Issue identity |
| `updatedAt` | 樂觀並行控制 | Gitea Issue |
| `type`, `priority`, `labels` | 顯示／替換 metadata 維度，保留其他 Labels | Gitea Issue Labels |
| `status`, `assignees`, `lastActionKey` | 顯示目前狀態與既有轉換脈絡 | Gitea state、status Labels、Assignees |

## Transient Editor State

metadata badge editor 僅保存 React UI 暫態：選單開啟、目前提交值、saving flag 與錯誤訊息。它不建立本機 Issue mirror；選單 trigger 始終依父層最新 Issue 值呈現。

## Validation and Invariants

- Priority 僅接受 `critical | high | medium | low`；Type 僅接受 `bug | feature | task`。
- metadata PATCH 必須帶目前 `updatedAt`；發生版本衝突時不得覆蓋 Gitea 最新資料。
- 一次更新只替換選取的 metadata 維度，其他 labels、Status 與排程資料保持不變。
- Status 僅能由既有 action 定義及 transition command 改變；Anomaly 不可轉換。
