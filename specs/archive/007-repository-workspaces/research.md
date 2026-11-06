# Research: Repository 工作區與跨庫看板

## Decision 1: 工作區不新增 persistence

- **Decision**: Repository workspace 由目前使用者可讀取的 Gitea Repository、workflow YAML 與 URL 即時計算。跨庫看板沿用 Board JSON 設定。
- **Rationale**: Issue 與 workflow state 的 Source of Truth 仍是 Gitea；既有 Board store 只需保留 Board 設定，不需要新增 Issue/workspace mirror。
- **Alternatives considered**: 建立 RepositoryWorkspace JSON 記錄或把單 repo workspace 寫入 Board store；兩者都會複製可從 Gitea/Convention 推導的範圍設定。

## Decision 2: 單 repo 與多 repo 使用明確不同的 context

- **Decision**: 使用 Repository identity `{owner, name}` 作單 repo context，Board ID 作多 repo context；各自回傳不同的 view metadata，不以虛構 Board ID 代表 Repository。
- **Rationale**: Board 專屬的欄位、shared config 與 transition membership 不應套用到單 repo workspace；兩種 context 可共用 columns、Gantt Issue rows 與基本卡片 UI。
- **Alternatives considered**: 直接建立暫存 Board 物件並交給所有 service；此法混淆 Board persistence/domain identity，也容易誤寫 Board route/metadata。

## Decision 3: 舊單 repo Board 保留 JSON，選擇器改列 Repository

- **Decision**: 不改寫或刪除舊 Board JSON entry；Board selector/管理列表只顯示 repositoryRefs 至少兩個的項目。舊單 repo 記錄的 Repository 已有自己的工作區入口，原設定仍保留在 Board store。
- **Rationale**: 符合選定的重新分類決策並避免遷移期間遺失 Board 設定。Board store schemaVersion 1 繼續接受非空且唯一 Repository refs。
- **Alternatives considered**: 刪除 legacy Board 或擴充 store schema 將它轉成另一種資料型別；都會破壞「保留設定」或引入不必要 schema migration。

## Decision 4: Repository Kanban 使用 YAML 的 exact Convention assignment

- **Decision**: 由 Repository 目前 YAML 的 `conventionId` 與 `conventionVersion` 精確解析 Convention。若 assignment 有效，即使與保留的 legacy Board Convention 不同，仍依 YAML 載入 Kanban/Gantt 並顯示差異提示；無 assignment 或無法 exact match 時不載入並回傳可辨識設定提示。
- **Rationale**: `AGENTS.md` 要求 Convention 由 workflow config 定義，Repository 與 Board 必須 exact match。Legacy Board record 不可覆蓋後續 YAML 設定。
- **Alternatives considered**: 優先採用舊 Board 儲存的 Convention；在 YAML 更新後會令同一 Repository 產生衝突狀態，也違反目前治理規則。

## Decision 5: 各檢視完整讀取分頁，Board Issues 先合併再分頁

- **Decision**: Repository 與 Board 的 Kanban/Gantt 讀取完整 Gitea pages。Board Issues 逐 repo 套用同一 filter，合併、以 updatedAt 遞減及 repository/number 穩定 tie-break 排序，再依 page/limit 回傳。Repository list 也讀取 `/user/repos` 所有 pages。
- **Rationale**: 使用者選的是完整 Repository/Board scope，不能因 100 件 API page size 靜默缺少 Issue 或 repo。任何必要 repository/page 失敗均整體失敗。
- **Alternatives considered**: 保留 Kanban 前 100 件或依 repo 分段分頁；前者造成同一 workspace view 資料不一致，後者無法提供一致的跨 repo 頁面排序與返回位置。

## Decision 6: Issue detail 使用受限的 app-local return path

- **Decision**: scoped Issue links 把來源 workspace/view/filter/page 編入 `returnTo`，Issue detail 只接受 Portal 內已知路由的相對 path。直接 Issue URL 或無效值返回全域 `/issues`。
- **Rationale**: `history.state` 不能支援重新載入或分享 Issue detail URL；限制相對路徑避免把返回連結用成任意外站跳轉。
- **Alternatives considered**: 使用 browser back 或 session storage；直接進入詳情時無可靠返回目標，也無法重現原 filter/page。

## Decision 7: 舊單 repo Board URL 顯示重新分類說明

- **Decision**: 使用者開啟舊單 repo Board URL 時顯示重新分類說明，要求使用者從工作區選擇器重新選 Repository；不自動導向 Repository 檢視，也不呼叫會觸發 repair 的 Board view API。
- **Rationale**: 符合使用者選擇的舊 URL 行為，並避免舊 Board ID 繼續暗中代表 Repository workspace。多 repo Board 舊 URL 保持不變。
- **Alternatives considered**: 自動轉址到同一 Repository view，或留在舊網址但直接渲染 Repository view。

## Decision 8: 保留的 legacy Convention 不覆蓋目前 YAML

- **Decision**: Repository workspace 一律使用目前 YAML assignment 的 exact Convention。若其與保留的單 repo Board Convention 不同，Kanban/Gantt 顯示提示但依目前 YAML 提供檢視；若目前 assignment 缺失或無法 exact match，Kanban/Gantt 顯示設定提示。
- **Rationale**: 保留使用者要求的 Board 設定，同時遵守 Convention YAML 為唯一設定來源及 Repository/Board exact match 規則。
- **Alternatives considered**: 讓 legacy Board Convention 覆蓋目前 Repository assignment，或自動改寫 YAML/JSON 設定。
