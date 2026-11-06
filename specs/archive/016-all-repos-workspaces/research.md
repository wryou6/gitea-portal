# Research: Repository 與 All repos 工作區

## Decision 1: 以目前使用者的 Repository 清單建立聚合範圍

**Decision**: 聚合查詢先取得目前 session 可讀取的 Repository，再對每個 Repository 讀取所有 Issue pages。全量結果完成後套用篩選、依 `updatedAt` 遞減排序（同時間依 owner/name/number 穩定排序），最後對合併結果分頁。任一必要 Repository 或 page 讀取失敗，整個請求失敗。

**Rationale**: 現有 `GET /api/issues` 無 Repository filter 時使用 Gitea 全域搜尋；其結果不是對每個 Repository 逐頁聚合，不能保證涵蓋 All repos 的全部可讀工作。現有 Board issue 聚合已有全頁 fanout、filter、穩定排序及全有全無失敗語意，可抽離範圍設定依賴後重用。

**Alternatives considered**: Gitea global issue search（無法保證每個 Repository 完整分頁）；瀏覽器端逐 repo 請求（重複多個平行請求與分頁狀態、較難保證無部分資料）。

## Decision 2: 將固定 Workflow view service 變成中性 Repository 集合服務

**Decision**: 共用 Kanban column resolver 接收 Gitea repository list，使用固定 workflow states 和現有 anomaly/visible-label 規則。Repository 專屬 route 與 All repos route 共用 resolver。Gantt 聚合所有 Repository 的 Issue pages，保留日期解析及 anomaly 行為。

**Rationale**: 固定 Workflow 已統一，狀態語意跨 Repository 相同。現有 Repository Kanban/Gantt 已具備可復用呈現形狀，Board view service 是主要可重用全頁查詢實作但回應和命名耦合 Board。

**Alternatives considered**: 按 Repository 分組多個 Kanban/Gantt（固定 workflow 下增加不必要分區）；保留 Board namespace（留下已退場產品概念與型別耦合）。

## Decision 3: 將 Workflow transition 移到 Issue/workflow domain

**Decision**: 將 transition service 移出 `apps/api/src/boards`，維持現有 Issue scoped route、permission check、fixed action/state validation、atomic Label replacement、assignee handling、rollback 及 `expectedUpdatedAt` optimistic concurrency。

**Rationale**: Transition endpoint 本來就是以 Repository/Issue 定位，不需要 Board identity；刪除 Board 子系統不應刪掉 Kanban 所需的 Gitea workflow transition。

**Alternatives considered**: 保留 boards 路徑（內部 naming 違反完整退場方向）；重寫 transition（風險破壞權限與原子寫入）。

## Decision 4: 路由及首頁採全庫檢視為預設

**Decision**: `/issues`、`/kanban`、`/gantt` 表示 All repos；根路徑顯示 All repos Gantt；`/dashboard` 保留為可選的工作區目錄；單 Repository routes 保留。未知路由（含任何 `/boards...`）顯示一般 404；不呼叫已移除 API。

**Rationale**: 使用者選擇登入後直接看 All repos Gantt，並明確取消舊 Board URL 相容。保留 Dashboard 不作為初始入口，避免移除既有工作區目錄資訊。

**Alternatives considered**: 保留 Board routes 顯示重新分類頁（使用者明確拒絕舊 URL 相容）；把 `/` 維持 Dashboard（與指定預設頁面不符）。

## Decision 5: 不新增 UI framework，延伸既有 UI primitives 和 Storybook

**Decision**: 依 `$ui-styling` 和 `$ui-ux-pro-max` 檢視並改善語意層級、focus、對比、鍵盤互動、窄螢幕和暗色主題；沿用現有 CSS design tokens、UI primitives 和 Storybook 8.6 light/dark toolbar。擴增虛構資料 stories 覆蓋工作區 selector、All repos 多 Repository 來源標示、loading/empty/error、mobile Kanban 選欄及 Gantt 狀態。

**Rationale**: repo 已有手寫 React/CSS 元件及 Tailwind v4，並設定 Storybook theme decorator；引入 shadcn/Radix 全套會改變堆疊而非支援此次工作區功能。

**Alternatives considered**: 加裝完整元件庫（scope/依賴過大）；只用既有單 Repository stories（無法驗證 All repos identity、錯誤與主題狀態）。

## Decision 6: 移除設定並清理已設定的 store

**Decision**: 移除 `BOARD_STORE_PATH` runtime config 與 `.env.example` 欄位；清除既有 Board JSON、對應 lock/temp 檔案與本機 `.env` 的 Board path entry。清理不得讀出、改動或記錄其他環境變數；若設定檔位於 workspace 外，依執行權限處理。

**Rationale**: 使用者明確選擇連既有設定檔一起移除，沒有 Board data migration 或舊 URL 相容需求。

**Alternatives considered**: 留下無讀取者的 orphan store（違反完整退場決策）；搬入新格式或匯出（使用者未要求，增加殘留與資料保留策略）。

## Performance and scale

沒有新的使用者可感知 SLA 或 Repository 數量上限。延用每次 Gitea 請求 timeout 10 秒；server 端按 Repository fanout，Repository 內序列讀取 pages；聚合完成前顯示 loading。不能因頁數或 Repository 數量達到硬編碼限制而回傳看似完整的部分結果。
