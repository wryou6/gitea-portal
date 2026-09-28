# Feature Specification: 登入狀態與 Session 處理

**Feature Branch**: `017-unauthenticated-experience`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: 沒有登入時的設計。未登入時顯示獨立登入頁，使用 Gitea OAuth 登入，成功後返回原先開啟的 Portal 頁面；session 過期時切換至登入頁並保留回跳位置；session 查詢服務暫時故障時顯示可重試狀態，不誤判為未登入；已登入使用者可以主動登出 Portal。

## Clarifications

### Session 2026-09-28

- Q: 如果 session 在 Issue 建立或編輯表單尚未送出時過期，重新登入後要怎麼處理尚未送出的內容？ → A: 不保存草稿；提示使用者登入後需重新輸入。
- Q: 登出 Portal 時，應只結束 Portal session，還是也結束 Gitea 的登入 session？ → A: 只結束目前 Portal session，保留 Gitea 登入狀態。

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 未登入時登入 Portal (Priority: P1)

尚未登入的工程師開啟 Portal 或直接進入任一工作頁面時，會看到清楚的登入入口，登入後能回到原先要使用的頁面。

**Why this priority**: 未登入者目前無法取得工作資料；清楚的登入入口是使用 Portal 的必要起點。

**Independent Test**: 清除 Portal session 後直接開啟首頁、Issue 清單及一個 Repository 工作頁，確認都顯示登入頁；完成 Gitea 登入後確認回到原路徑。

**Acceptance Scenarios**:

1. **Given** 使用者沒有有效 Portal session，**When** 使用者開啟任一 Portal 路由，**Then** Portal 顯示獨立登入頁，不呈現工作區導覽或 Issue 資料。
2. **Given** 使用者位於登入頁，**When** 使用者選擇 Gitea 登入並完成授權，**Then** Portal 建立登入狀態並回到登入前的 Portal 路徑及查詢參數。
3. **Given** 使用者沒有提供有效的 Portal 回跳位置，**When** Gitea 登入成功，**Then** Portal 開啟預設首頁。

---

### User Story 2 - Session 過期後繼續原工作 (Priority: P1)

正在使用 Portal 的工程師遇到登入狀態失效時，可重新登入並回到原本的工作位置。

**Why this priority**: Session 過期若只在個別資料區顯示一般錯誤，使用者無法辨識需要重新登入，也容易失去目前工作脈絡。

**Independent Test**: 使用已過期的 session 開啟受保護頁面及執行中的工作操作，確認收到未授權回應後切換至登入頁；重新登入後確認原路徑與查詢參數恢復。

**Acceptance Scenarios**:

1. **Given** 使用者已開啟 Portal 頁面，**When** 其 session 失效且受保護操作被拒絕，**Then** Portal 切換至登入頁並保留目前路徑及查詢參數。
2. **Given** 使用者因 session 失效而位於登入頁，**When** 使用者重新完成 Gitea 登入，**Then** Portal 回到原頁面並重新載入該頁資料。
3. **Given** 使用者在 Issue 建立或編輯表單中有尚未送出的內容，**When** session 失效並完成重新登入，**Then** Portal 返回原表單路徑並提示重新輸入；未送出的欄位內容不會被保存或還原。

---

### User Story 3 - 分辨登入狀態與暫時服務故障 (Priority: P1)

使用者的登入狀態查詢暫時無法完成時，能看到服務暫時不可用的說明並重試，而不會被要求進行不必要的登入。

**Why this priority**: 把網路或 Portal 服務故障當成未登入會造成錯誤操作，也無法讓使用者知道登入服務目前不可用。

**Independent Test**: 分別模擬未登入回應與 session 查詢的網路／伺服器錯誤，確認前者顯示登入頁、後者顯示服務錯誤及重試入口。

**Acceptance Scenarios**:

1. **Given** Portal 無法連線或登入狀態查詢發生暫時服務錯誤，**When** 使用者開啟 Portal，**Then** Portal 顯示可理解的服務錯誤與重試操作，不將使用者視為未登入。
2. **Given** 使用者看到登入狀態查詢錯誤，**When** Portal 服務恢復且使用者選擇重試，**Then** Portal 重新查詢登入狀態並顯示對應頁面。
3. **Given** Gitea 拒絕登入或登入流程失敗，**When** 使用者返回 Portal，**Then** Portal 顯示登入失敗訊息並提供再次登入的入口。

---

### User Story 4 - 主動登出 Portal (Priority: P1)

已登入的工程師可從帳戶選單主動結束目前的 Portal 工作階段；登出完成後，Portal 不再顯示先前帳戶的工作內容。

**Why this priority**: 使用者可能在共用工作站結束工作，必須能明確關閉 Portal 存取權。

**Independent Test**: 登入 Portal 後從帳戶選單登出，確認回到獨立登入頁；重新開啟先前受保護 URL，確認先前的 Portal session 與工作資料無法繼續使用。

**Acceptance Scenarios**:

1. **Given** 使用者已登入 Portal，**When** 使用者從帳戶選單選擇登出且 Portal 確認登出完成，**Then** Portal 使目前工作階段失效並顯示登入頁，不呈現工作區導覽或 Issue 資料。
2. **Given** 使用者已完成登出，**When** 使用者在同一瀏覽器重新開啟先前的受保護 Portal URL，**Then** Portal 顯示登入頁且不使用先前的 Portal session。
3. **Given** 登出要求因網路或服務錯誤未獲確認，**When** 使用者嘗試登出，**Then** Portal 不得宣稱登出成功，並提供可理解的錯誤與重試方式。
4. **Given** 使用者已登出 Portal，**When** 使用者再次選擇 Gitea 登入，**Then** Portal 重新啟動登入流程；既有 Gitea 登入狀態仍有效，可能由 Gitea SSO 直接完成授權。

### Edge Cases

- 不存在、格式錯誤或非 Portal 站內的回跳位置不得導向外部網站；登入成功時改開預設首頁。
- 未知 Portal 路徑不得作為登入後回跳目標；登入成功時改開預設首頁。
- 使用者在 Gitea 取消或拒絕授權時，Portal 保持未登入並顯示可重試的登入狀態。
- 登入狀態查詢載入期間不得短暫呈現已登入工作頁或錯誤的匿名提示。
- Issue 建立或編輯表單的未送出內容不會因重新登入流程而保存；使用者返回表單時會收到需重新輸入的提示。
- 登入頁在桌面與窄螢幕、鍵盤操作、輔助科技及淺色／深色主題下均須可讀且可操作。
- 登出只影響目前 Portal 瀏覽器工作階段，不結束 Gitea 身分提供者的登入狀態。
- 登出要求未獲伺服器確認時，不得把仍有效的 Portal 工作階段呈現為已登出。

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Portal MUST 在載入期間確認登入狀態，並清楚區分有效登入、未登入及登入狀態暫時無法確認。
- **FR-002**: 對未登入使用者，所有受保護 Portal 路由 MUST 顯示獨立登入頁，不呈現受保護工作資料或主要工作導覽。
- **FR-003**: 登入頁 MUST 提供使用既有 Gitea 帳號登入的明確入口；Portal MUST NOT 要求使用者在 Portal 建立另一組帳密。
- **FR-004**: Portal MUST 在成功登入後返回有效的原 Portal 路徑及其查詢參數；回跳目標 MUST 限於已知 Portal 路由，並拒絕外部或未知目標。未提供有效目標時 MUST 開啟預設首頁。
- **FR-005**: 當使用中的登入狀態失效且受保護操作被拒絕時，Portal MUST 切換至登入頁、保留目前位置，並在重新登入後返回及重新載入該位置。
- **FR-006**: Portal MUST 將明確的未登入狀態與網路或服務暫時故障分開呈現；查詢錯誤 MUST 提供重試方式，不得直接判定為未登入。
- **FR-007**: Gitea 拒絕授權或登入流程失敗時，Portal MUST 顯示可理解的錯誤及再次登入入口，且不得建立已登入狀態。
- **FR-008**: 登入頁、查詢錯誤、登入失敗及登出提示 MUST 使用專案支援的繁體中文、英文與日文翻譯，並符合鍵盤操作及輔助科技的基本辨識需求。
- **FR-009**: 登入狀態及登入流程 MUST 遵守目前 Gitea 使用者的授權範圍；Portal MUST NOT 以較高權限的身份代替使用者存取資料。
- **FR-010**: Session 失效造成 Issue 建立或編輯表單離開時，Portal MUST NOT 保存或還原尚未送出的欄位內容，並 MUST 提示使用者重新輸入。
- **FR-011**: 已登入使用者 MUST 能從帳戶選單啟動 Portal 登出。
- **FR-012**: Portal 確認登出完成後 MUST 使目前 Portal 工作階段失效、清除已登入介面，並顯示獨立登入頁；重新開啟受保護路由時 MUST 再次要求使用者啟動登入。
- **FR-013**: 登出要求未獲確認時，Portal MUST 呈現錯誤並提供重試，不得顯示登出成功狀態。
- **FR-014**: Portal 登出 MUST 只使目前 Portal 工作階段失效，並 MUST 保留 Gitea 登入狀態。

### Key Entities

- **登入狀態**：表示目前 Portal 使用者是否已通過 Gitea 登入、尚未登入，或暫時無法確認。
- **回跳位置**：使用者開始登入前的 Portal 路徑及查詢參數；僅在登入流程中用來恢復導覽位置。
- **登入失敗狀態**：表示使用者取消授權或登入流程未成功；不代表有效登入狀態。

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 對所有已知受保護路由，未登入使用者都會看到登入頁，且不會看到受保護資料。
- **SC-002**: 有效回跳位置在成功登入後 100% 回到相同路徑及查詢參數；無效位置 100% 回到預設首頁且不離開 Portal。
- **SC-003**: Session 過期後，使用者重新登入可在一次登入流程完成後返回原頁面，且該頁資料會重新載入。
- **SC-004**: Session 查詢的暫時網路或服務錯誤 100% 呈現可重試的錯誤狀態，不呈現為一般未登入狀態。
- **SC-005**: 登入頁主要操作可用鍵盤完成，且所有新增使用者可見文字在三種支援語系中皆有對應內容。
- **SC-006**: 使用者確認登出後，在 100% 的後續受保護路由存取中都不會看到先前 Portal 帳戶的工作資料，直到再次完成 Portal 登入。

## Assumptions

- Portal 續用現有 Gitea OAuth 登入及 Portal session，不新增 Portal 帳號或密碼管理。
- Portal 首頁是有效回跳位置缺失或不合法時的預設目的地。
- 登入頁依 Portal 目前可判定的語系顯示；無個人語系偏好時使用瀏覽器可辨識語系，否則使用繁體中文。
- Session 失效後只恢復 Portal 導覽位置，不恢復 Issue 表單中尚未送出的內容。
- 登出只清除目前瀏覽器的 Portal 工作階段；使用者再次啟動登入時可沿用仍有效的 Gitea SSO 狀態。
- 此功能不新增登入者資料、Issue mirror 或伺服器端偏好資料。
