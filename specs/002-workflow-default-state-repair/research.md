# Research: Workflow Default State Repair

## Scope

本階段不選擇新的語言、Framework、Database、部署方式、Authentication、Caching 或測試框架。研究目標是確認 feature 應如何接入目前 repository，並把 spec 中的行為決策轉成可供 Phase 1 使用的設計約束。

## Decision 1: 沿用現有 monorepo 分層

**Decision**: 修復規則放在 `packages/domain`，Gitea side effect 放在 `apps/api`，API view 型別放在 `packages/gitea-contracts`，Board 呈現與拖曳行為放在 `apps/web`。

**Rationale**: 現有 codebase 已有 `resolveWorkflowState`、`getBoardView`、`transitionCard` 與 `replaceIssueLabelsAtomically`。沿用這些邊界可避免把 Gitea 寫入、產品狀態分類與 UI 呈現混在一起。

**Alternatives considered**: 新增獨立 repair service 或新的 persistence layer；不採用，因為本 feature 不是另一套 Issue system，且會增加與 Gitea Source of Truth 不一致的風險。

## Decision 2: Board load 同步完成修復後才呈現

**Decision**: `GET /api/boards/:id` 在回傳 Board view 前等待本次所有 anomaly repair attempts；每個 Card 的失敗結果獨立保留，不阻斷其他 Card。

**Rationale**: 符合 clarification 與 FR-016，使用者不會先看到會瞬間移動的暫態 anomaly 卡片；同時 `Promise.all` 的逐項結果可滿足 partial failure。

**Alternatives considered**: 先回傳 Board、背景修復；不採用，因為會讓畫面與 Gitea 實際狀態在同一次載入中短暫不一致，也使「Board 載入完成」難以驗收。

## Decision 3: 使用既有 atomic label replacement

**Decision**: 所有自動或手動 Workflow transition 都使用既有 `replaceIssueLabelsAtomically`，執行 current issue/version/labels preflight、一次 replacement、post-write re-read/verification。

**Rationale**: Gitea 是唯一 Source of Truth；remove-then-add 可能留下半套 labels，不符合 FR-005。既有 helper 已包含並行修改防護與 persistence verification。

**Alternatives considered**: 先刪除 Workflow Labels 再新增目標 Label；拒絕，因為中途失敗會破壞工作狀態。

## Decision 4: Default state 由最小 `order` 推導

**Decision**: 不新增 `defaultStateKey`。Convention 至少要有一個 state，且 `order` 唯一；最小 `order` 的 state 是唯一 default。

**Rationale**: 已由 spec 決定，並保持 default 定義與 Convention state list 同源。

**Alternatives considered**: 每個 Board 個別設定 default 或新增 Convention default 欄位；不採用，避免與既有 Convention identity/version 及 Board compatibility 規則分裂。

## Decision 5: 修復錯誤是 read-time annotation，不持久化

**Decision**: Board Card response 可帶 `workflowRepair` annotation，描述本次 auto-repair 的成功或失敗；不寫入 JSON Board store，也不建立 Issue snapshot。

**Rationale**: 使用者需要辨識修復結果，但 Gitea Issue 仍是唯一真實資料。下次載入必須重新依當下 Gitea labels 判定，符合 FR-015。

**Alternatives considered**: 在 Portal database/JSON 保存 repair status；不採用，會產生過期狀態並違反 Source of Truth 原則。

## Decision 6: Anomaly Card 允許明確手動拖曳

**Decision**: 自動修復失敗的 `unconfigured` 或 `conflict` Card 仍可拖曳到有效 Workflow state；寫入失敗時維持 anomaly 與錯誤。

**Rationale**: 已由 clarification 決定，提供人工修復彈性，同時維持真實 Gitea 狀態。手動操作仍必須通過現有 permission、preflight、atomic replacement 與 verification。

**Alternatives considered**: 修復失敗後鎖定 Card；不採用，因為會阻止使用者在 Gitea 暫時修正或權限恢復後從 Portal 直接完成工作。

## Decision 7: 區分 Board read failure 與 per-Card repair failure

**Decision**: 如果 Board 所需的 Issue 或 Repository 資料無法從 Gitea 讀取，`GET /api/boards/:id` 回傳整體外部服務錯誤，不呈現不完整 Board。若 Issue 已成功讀取，但該 Issue 的 Label replacement 或 verification 失敗，回傳 200 Board view，該 Card 保留 anomaly 與 per-card error，其他已讀取 Card 繼續呈現。

**Rationale**: 沒有可呈現的真實 Issue data 時，Portal 不能假裝有完整 Board；已取得真實 Issue data 後，單一寫入失敗可以安全地局部呈現並讓團隊繼續工作。

**Alternatives considered**: 所有 Gitea 錯誤都回傳整體錯誤，會放大單 Card 修復失敗的影響；所有錯誤都轉成 per-Card，則無法可靠表示 Issue query 本身失敗。

## Decision 8: 將 3 秒辨識目標納入 quickstart 驗證

**Decision**: quickstart 量測 Board load 開始到使用者可辨識 repaired/failed Card 結果的 elapsed time，驗證在既定 dummy data 情境下不超過 3 秒。

**Rationale**: SC-006 是可驗收的使用者結果，不應只停留在 plan 的文字目標；量測留在手動/端到端驗證，不引入新的測試框架或效能服務。

**Alternatives considered**: 不驗證 3 秒目標；拒絕，因為會讓既有 Success Criterion 沒有完成信號。

## Decision 9: Convention validation 在 loader 邊界完成

**Decision**: `apps/api/src/workflows/convention-loader.ts` 必須拒絕空 state list、負數 `order` 與重複 `order`；domain resolver 同時保留 defensive validation。

**Rationale**: 設定載入時就阻擋 invalid Convention，可避免 Board repair flow 收到無法選出 default state 的資料；resolver 的重複檢查則防止其他呼叫路徑繞過 loader。

**Alternatives considered**: 只在 Board load 時檢查；拒絕，因為 invalid configuration 會在更晚階段才失敗，錯誤定位與操作回復較差。

## Resolved Unknowns

| Topic | Resolution |
|---|---|
| New technology | None; use existing TypeScript/Fastify/React/Vite monorepo |
| Persistence | No new persistence; existing Board JSON remains unchanged |
| Repair trigger | Board load only |
| Rendering timing | Wait for all repairs before returning Board view |
| Failure behavior | Preserve anomaly, show per-card error, continue other cards |
| Retry behavior | Reload/retry reads current Gitea data |
| Workflow default | State with minimum unique `order` |
| Missing default label | Do not create it automatically |
| Manual repair | Failed anomaly Card may be dragged to a valid state |
| Non-workflow labels | Preserve unchanged |
| Gitea read failure | Whole Board external-service error |
| Gitea repair write failure | Per-Card error after Issue read succeeds |
| 3-second outcome | Validate in quickstart from load start to visible result |
| Convention validation | Loader boundary plus defensive domain validation |
