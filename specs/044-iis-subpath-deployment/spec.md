# Feature Specification: IIS 子路徑部署支援

**Feature Branch**: `044-iis-subpath-deployment`

**Created**: 2026-11-06

**Status**: Draft

**Input**: User description: "Portal 部署在 IIS 預設網站下的 `/issue` 子應用程式時，前端路由、API、OAuth 和靜態資源都必須能在該子路徑正常運作；同時保留根目錄部署能力。"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 在 IIS 子應用程式中使用 Portal (Priority: P1)

工程師從 IIS 預設網站的 `/issue` 子應用程式開啟 Portal，登入後可瀏覽工作區、Issues、Kanban 與 Gantt，重新載入目前頁面仍能回到相同檢視。

**Why this priority**: 目前目標部署位置是既有網站下的 `/issue` 應用程式；路徑不一致會使前端資源、API 或登入任一環節失效，Portal 即無法使用。

**Independent Test**: 將前端產物部署至 `/issue`，由使用者入口開啟並完成登入，依序檢查頁面資源、資料載入、Issue 操作與深層路徑重新載入。

**Acceptance Scenarios**:

1. **Given** Portal 部署在 `/issue`，**When** 使用者開啟入口，**Then** 前端程式、樣式與圖示皆由 `/issue` 路徑載入，不向網站根目錄要求 Portal 資源。
2. **Given** 使用者位於 `/issue` 下任一 Portal 檢視，**When** 瀏覽或重新載入 Issues、Kanban、Gantt、設定或 Issue 詳情路徑，**Then** Portal 顯示對應檢視且網址保留 `/issue` 前綴。
3. **Given** Portal 的 API 服務可用，**When** 使用者載入資料或執行登入、登出，**Then** Portal 的 API 與認證請求皆使用 `/issue` 前綴並成功完成。
4. **Given** 使用者開始 Gitea OAuth 登入，**When** Gitea 導回 OAuth callback，**Then** Portal 完成登入並回到 `/issue` 下原先檢視；登入取消或失敗時，錯誤訊息也顯示於 `/issue` 下。

---

### User Story 2 - 維持根目錄部署 (Priority: P2)

維護者在未設定子路徑時，仍可將 Portal 部署於網站根目錄，既有入口、登入和檢視路由維持正常。

**Why this priority**: 子路徑部署支援不可破壞目前以根路徑提供 Portal 的本機或既有環境。

**Independent Test**: 使用預設根路徑建置並執行 Portal，確認靜態資源、前端路由、API、OAuth 和 cookie 沿用根路徑。

**Acceptance Scenarios**:

1. **Given** 未設定部署子路徑，**When** 使用者開啟根目錄 Portal 並登入，**Then** 所有資源、API、認證流程和頁面路由仍使用網站根路徑且運作正常。

### Edge Cases

- 子路徑設定帶有或不帶結尾斜線時，產生的資源與導覽網址需一致且不得重複斜線。
- OAuth 回傳的 `returnTo` 無效或不在 Portal 子路徑時，使用者仍須回到該 Portal 的安全預設入口。
- 登入逾期、登出及 OAuth 失敗時，session、CSRF 與 OAuth 暫存 cookie 的路徑須與部署位置一致，不能留下無法清除的 Portal cookie。
- 部署主機無法套用隨前端產物提供的 SPA 回退規則時，需由主機提供等效的路徑回退行為。
- SPA 回退不得攔截 `/issue/api/*`、`/issue/auth/*`，也不得把實際存在的靜態檔案改寫為入口頁。

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Portal MUST 支援設定公開部署路徑，並以 `/issue` 作為本功能的驗收子路徑。
- **FR-002**: Portal MUST 將靜態資源網址、前端路由、API 請求及認證入口導向設定路徑下的對應位置。
- **FR-003**: OAuth callback、成功或失敗後的返回位置 MUST 保留設定路徑，並限制返回至同一 Portal 的已知路由。
- **FR-004**: Session、CSRF 與 OAuth 暫存 cookies MUST 使用符合公開部署路徑的 Path，且登出或失效時能以相同 Path 清除。
- **FR-005**: IIS 部署產物 MUST 提供 SPA 深層路徑回退至 Portal 入口頁的規則；回退 MUST 保留瀏覽器要求的 Portal 路徑，並排除既有靜態檔案、API 與認證請求。
- **FR-006**: 未設定公開部署路徑時，Portal MUST 維持根目錄部署行為。
- **FR-007**: Portal 前端與 API 的公開路徑設定不一致時，部署文件 MUST 明確說明需一致設定的值與 API 路徑轉送前置條件。

### Key Entities _(include if feature involves data)_

- **公開部署路徑**：Portal 對使用者可見的網站路徑；可為根目錄或 `/issue` 等子路徑，供資源、路由、API 和認證流程共用。
- **Portal 檢視路徑**：使用者可直接開啟或重新載入的工作檢視及 Issue 詳情路徑，位於公開部署路徑之下。
- **認證返回位置**：OAuth 完成、取消或失敗後使用者返回的 Portal 路徑；必須限制於同一 Portal。

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 在 `/issue` 部署情境中，入口頁所需的全部 JavaScript、CSS 與圖示請求均成功，且沒有 Portal 靜態資源請求落至網站根路徑。
- **SC-002**: 對入口、Issues、Kanban、Gantt、設定與 Issue 詳情等至少 6 種路徑執行直接開啟或重新載入，均能顯示對應 Portal 檢視。
- **SC-003**: OAuth 登入成功、取消、失敗、登出和 session 逾期五種流程都停留於 `/issue` Portal，且 cookies 均由正確路徑建立及清除。
- **SC-004**: 根路徑預設建置下，現有入口、靜態資源、API、認證和檢視路由全部維持可用。

## Assumptions

- Portal 前端由 IIS 提供靜態檔；Fastify API 以獨立 Node.js 程序執行，部署環境負責讓同站的 `/issue/api` 與 `/issue/auth` 請求到達 API。
- IIS 子應用程式 `/issue` 是目前目標；公開路徑應可設定，避免程式碼固定綁定該字串。
- 前端部署產物會附帶通用 IIS SPA 回退規則；API 與認證路徑轉送仍由目標主機設定。
- 部署主機需能套用隨產物提供的 SPA 回退規則，或提供等效行為。
- Gitea OAuth Application 的 callback URL 需與公開部署路徑一致。
