# Research: Hide Workflow Labels on Board Cards

## Scope

本 feature 只處理 Board Card 的呈現，不改變 Gitea Issue 的 Labels、Issue list/detail 的完整資料或 Board transition 行為。

## Decision 1: Board 使用 read-time `visibleLabels`，不新增呈現層 mutation

**Decision**: Board view 在回應組合時，依所選 Workflow Convention 建立 `visibleLabels`；它只包含不屬於該 Convention 的 Labels。`visibleLabels` 的計算本身不寫入 Gitea 或 Portal storage；既有 Workflow auto-repair 若因缺失或衝突而執行，仍依原規則寫回 Gitea。

**Rationale**: 使用者需要乾淨的 Board Card，但 Gitea 必須維持完整 metadata。衍生 view 欄位可同時保留資料完整性與 UI 簡潔性，且不改變既有 repair side effect。

**Alternatives considered**: 寫回 Gitea、刪除 Label、建立 Portal snapshot；都會混淆呈現需求與 Source of Truth，故不採用。

## Decision 2: 以 Convention state label definitions 判斷

**Decision**: Workflow Label identity 來自 Board exact Convention 的 state `labelName`，不從 prefix、顯示文字或固定命名規則推斷。

**Rationale**: 團隊可使用不同 Workflow Convention 與 namespace；Board compatibility 已提供正確的 Convention context。

**Alternatives considered**: 固定過濾 `workflow-*` 或 `workflow:`；無法支援尚未定案的命名 convention，故不採用。

## Decision 3: 只調整 Board Card，保留其他 read paths

**Decision**: Kanban Card 使用 `visibleLabels`；Issue list、Issue detail、原始 Gitea Issue 繼續使用完整 `labels`。

**Rationale**: 使用者可在 Board 快速管理工作，也能在需要診斷或編輯時取得完整資訊。

**Alternatives considered**: 全 Portal 共用隱藏規則；會降低 Issue 操作與除錯能力，故不採用。

## Decision 4: Empty display labels omit the container

**Decision**: 沒有一般 Labels 時，Board Card 不呈現空的 Label 區域；Repository、Issue number、Title、Assignee、狀態與 repair error 不受影響。

**Rationale**: 避免空白 UI 佔用 Card 空間，同時保留辨識工作項目所需的核心資訊。

## Decision 5: No new persistence or mutation

**Decision**: `visibleLabels` 不保存；Board view 組合不因顯示規則執行 Label 新增、刪除或替換。既有 Workflow auto-repair 的 Label 更新流程維持原行為，不由本 feature 新增或改寫。

**Rationale**: 這是 presentation-only feature，且必須維持 Gitea 為唯一 Source of Truth。

## Resolved Unknowns

| Topic | Resolution |
|---|---|
| Hidden label scope | Board 所選 exact Workflow Convention 的 state Labels |
| Other-convention Labels | 不因本 feature 修改；仍是完整 Issue data，是否呈現由 `visibleLabels` 規則保留 |
| Issue list/detail | 維持完整 Labels，不套用 Board Card filter |
| Persistence | None; `visibleLabels` 是 read-time view data |
| Failure display | 保留 workflowRepair annotation、anomaly column 與 error message |
| Empty labels | Omit empty Label container |
