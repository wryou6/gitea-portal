# Feature Specification: 分層自動化測試

**Feature Branch**: `047-test-coverage`
**Created**: 2026-11-06
**Status**: Implemented
**Input**: 為 Gitea Portal 建立前後端分層自動化測試，涵蓋 API、Web 與關鍵端對端流程。

## Clarifications

- 第一階段包含 API/domain、Web、contract 與少量 E2E 測試。
- API 測試以 HTTP mock 驗證 Gitea adapter，不連接真實 Gitea。
- 不設定整體 coverage 百分比，改以權限、Status/Label 原子更新與並行衝突等高風險案例作為必測項。

## User Scenarios & Testing

### User Story 1 - 驗證 API 與共用規則 (Priority: P1)

工程師修改 API 或共用資料規則時，可執行自動化測試確認回應、權限界線、Gitea 資料轉換與錯誤處理符合預期。

**Why this priority**: API 代表 Portal 對 Gitea 的資料與權限邊界，錯誤可能造成資料誤寫或越權讀取。

**Independent Test**: 在不連線真實 Gitea 的條件下，執行 API/domain 測試並確認成功及失敗路徑結果。

**Acceptance Scenarios**:

1. **Given** API 收到有效請求，**When** Gitea 回傳預期資料，**Then** API 回應符合既有 contract。
2. **Given** Gitea 回傳錯誤或呼叫者無權存取資料，**When** API 處理請求，**Then** Portal 回報適當錯誤且不偽造成功結果。
3. **Given** 測試驗證 Issue Status 或 Label 更新，**When** 更新條件不符或並行版本已改變，**Then** 系統拒絕不安全更新並保留未涉及資料。

### User Story 2 - 驗證 Web 邏輯與互動 (Priority: P1)

工程師修改 Web 的工作檢視邏輯時，可快速執行測試確認篩選 query 的清理、跨檢視狀態保留與預設值。

**Why this priority**: Web 目前沒有獨立測試，單一 E2E 無法快速定位純邏輯與元件回歸。

**Independent Test**: 執行 Web 純邏輯測試，確認有效、無效、重複與空 query 狀態符合規則。

**Acceptance Scenarios**:

1. **Given** 相同輸入資料，**When** Web 執行格式化或篩選，**Then** 結果符合固定規則且不依賴瀏覽器服務。
2. **Given** URL 含有無效或其他檢視專用參數，**When** 轉換或清理工作檢視 URL，**Then** 僅保留允許的共用狀態與目標檢視狀態。

### User Story 3 - 驗證跨層使用流程 (Priority: P2)

工程師可透過少量瀏覽器端對端測試確認使用者能載入 Kanban 工作檢視並操作欄內捲動。

**Why this priority**: 瀏覽器測試能捕捉 URL、資料載入與版面互動整合問題，但執行成本較高，應聚焦代表性流程。

**Independent Test**: 執行 Playwright Kanban 測試，mock API 資料後確認卡片載入、欄內捲動與頁面不發生整頁捲動。

**Acceptance Scenarios**:

1. **Given** 測試提供可控的 session、Repository 與 Kanban 回應，**When** 使用者開啟 Repository Kanban，**Then** 正確的狀態欄與卡片會呈現。
2. **Given** 執行測試套件，**When** 單一測試失敗，**Then** 輸出能指出失敗測試與原因，且既有 Kanban 捲動測試仍可執行。

## Edge Cases

- Gitea timeout、拒絕存取、空資料或格式異常時，測試需驗證可觀察的錯誤行為。
- 狀態或 Labels 發生並行更新時，測試不得只驗證成功路徑。
- 測試不得依賴正式 Gitea、真實帳號、credentials 或持久化的共享資料。
- 單一測試失敗或測試順序改變時，不得污染其他測試的狀態。

## Requirements

### Functional Requirements

- **FR-001**: 專案 MUST 提供可重複執行的 API/domain 自動化測試，涵蓋主要成功、錯誤及權限拒絕行為。
- **FR-002**: 專案 MUST 提供 Web 自動化測試，涵蓋代表性純邏輯與使用者互動行為。
- **FR-003**: 測試 MUST 驗證前後端共用資料契約的一致性，避免僅以型別編譯成功代表執行時回應正確。
- **FR-004**: 測試 MUST 覆蓋 Gitea 權限委派、Status/Label 安全更新及並行衝突等高風險行為。
- **FR-005**: 專案 MUST 保留精簡的瀏覽器端對端測試，驗證選定的重要使用流程。
- **FR-006**: 測試 MUST 可在不使用正式 Gitea credentials 或修改正式資料的環境執行。
- **FR-007**: 測試 MUST 能由明確的 workspace 指令執行，並讓工程師辨識各測試層的結果。

## Key Entities

- **測試案例**：針對一項使用者可觀察行為或系統規則的自動化驗證。
- **測試替身**：隔離 Gitea 或其他外部依賴的可控回應來源。
- **測試層級**：API/domain、Web 邏輯與互動、跨層端對端等不同驗證範圍。

## Success Criteria

### Measurable Outcomes

- **SC-001**: 工程師可使用文件化指令分別執行 API/domain、Web 與端對端測試。
- **SC-002**: 高風險權限與 Issue Status/Label 更新規則具有成功、拒絕及衝突情境的自動化驗證。
- **SC-003**: 測試套件不需連線正式 Gitea，且不需真實 credentials 即可執行。
- **SC-004**: 既有 Kanban 捲動 E2E 可與新增測試一起執行。

## Assumptions

- 初始範圍聚焦 API/domain 測試、Web 純邏輯測試與一條代表性 Kanban E2E；不建立追求覆蓋率百分比的門檻。
- 測試使用隔離的替身資料，不建立或修改正式 Gitea 測試資料。
- Contract 測試以現有 domain 與 Gitea contracts 為基礎，不新增 Portal persistence 或更改產品 API。
