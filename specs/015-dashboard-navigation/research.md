# Research: Dashboard 與共通工作介面

## Decision 1: 組合既有工作區來源

- **Decision**: Dashboard 平行讀取 `/api/repositories` 與 `/api/boards`，把可讀 Repository 與可讀跨庫 Board 組成工作區項目。跨庫 Board 僅在其所有 Repository 都出現在可讀清單時列出。載入中、空清單、錯誤分開呈現；任一必要來源失敗時不將另一來源的結果標記為完整清單。
- **Rationale**: `WorkspaceSelector` 已使用相同兩個來源與 Board 可讀性過濾；重用此權限語意可避免 Dashboard 曝露使用者無法閱讀的 Board。完整清單需要兩種來源都成功，避免違反「所有工作區」的預設。
- **Alternatives considered**: 新增 Dashboard API 聚合端點會重複既有客戶端組合且擴張 API contract；只列 Repository 會遺漏跨庫看板；來源失敗時靜默顯示部分項目會造成錯誤完整性暗示。

## Decision 2: Dashboard 路由與相容性

- **Decision**: 新增 `/dashboard` 作為 canonical Dashboard URL，並讓 `/` 顯示相同 Dashboard。保留 `/issues` 與 Issue/Board/Repository 現有路徑行為；導覽連結指向 `/dashboard`。
- **Rationale**: 使用者要求 Dashboard 成為預設入口；顯式 `/dashboard` 便於分享和在頁首建立穩定連結，而 `/issues` 仍保留原功能。
- **Alternatives considered**: 把 `/issues` 改成 Dashboard 會改變既有明確路徑語意；只把 `/` 改成 Dashboard 而無 canonical route 會降低可辨識性。

## Decision 3: 共用品牌與導覽

- **Decision**: 在既有 AppShell 頁首將品牌改為不可互動的圖示加 `Gitea Portal` 文字，並緊鄰一個可鍵盤操作、可標示目前頁面的 Dashboard 連結。保留工作區選擇器、帳號選單、側欄及其他現有路由入口；Dashboard 顯示「所有工作區」選項且由 Dashboard 本身負責呈現載入錯誤，避免重複錯誤提示。
- **Rationale**: 頁首集中實作能保證三個頁面的品牌和導覽一致；保留既有工作區選擇器可延續從 Kanban/Gantt 切換 Repository 或 Board 的工作流。
- **Alternatives considered**: 各頁重複實作導覽會產生不一致；移除 selector 會刪除既有跨工作區切換能力。

## Decision 4: Gitea 標記與外部依賴

- **Decision**: 使用 `apps/web/public/favicon.svg` 中的本地 Gitea 杯子/分支標記作為頁首圖示與 favicon；瀏覽器頁面標題和可見品牌文字都使用 `Gitea Portal`。圖示設為裝飾，讀屏名稱由可見文字提供；不載入遠端圖檔或新增圖示套件。
- **Rationale**: 重用單一本地 SVG 可讓頁首與瀏覽器分頁品牌一致，不需網路依賴或重複圖形實作。
- **Alternatives considered**: 外部圖片增加可用性與部署依賴；安裝 icon package 增加本次功能不需要的 runtime dependency。

## Decision 5: 返回 Repository Issues 操作

- **Decision**: 移除 `KanbanBoard` 中 Repository view 專用的返回 Issues 連結；跨庫 Board 專用的返回 Board 入口維持原行為，頁首與側欄提供一般頁面導覽。
- **Rationale**: 精確符合「Back to repository issues」移除範圍，同時保留跨庫 Board 頁面的既有上下文入口。
- **Alternatives considered**: 移除所有 Board 返回連結會擴大使用者要求，並改變跨庫 Board 的既有導覽。
