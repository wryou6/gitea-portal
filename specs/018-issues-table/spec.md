# Feature Specification: Issues 表格與 Status 統一

**Feature Branch**: `018-issues-table`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: 將 Issues 頁面重新設計為 table，顯示 Issue Type、Key、Subject、Assignee、Status、Priority、Created、Start Date、Due Date、Registered by；所有欄位可排序，預設依 Key 排序，每頁最多 50 筆，逾期日期醒目呈現，並以 Storybook 設計與檢視。View Options 設定欄位顯示與單欄位預設排序，表格欄序可直接拖曳表頭欄位名稱調整，並以表格上方按鈕保存為預設；偏好記錄於 cookie。

## Clarifications

### Session 2026-09-28

- Q: 表格欄名要採用 Gitea 介面的原生名稱嗎？ → A: 使用者指定 `Subject` 改為 `Title`、`Created` 改為 `Created at`、保留 `Due Date`；建立者欄採用 `Author`。
- Q: `Status` 欄要顯示 Gitea 的 Open／Closed，還是 Portal 三態 Todo／In Progress／Done？ → A: 顯示 Portal 三態 Todo／In Progress／Done，欄名使用 `Status`。
- Q: Issue Type 欄名要如何縮寫？ → A: 欄名使用 `Type`。
- Q: 把既有流程狀態概念全面改名為 Status，並遷移 Gitea Labels，要納入目前的 Issues 表格規格 018 嗎？ → A: 納入規格 018，表格與全域改名、Label 遷移一起規劃。
- Q: Status 改名時，舊的 Gitea 狀態與轉換原因 Labels 應如何處理？ → A: 一起遷移狀態與轉換原因 Labels；遷移完成前兼容讀取舊 prefix，完成後移除產品中的舊詞彙。
- Q: 若使用者能讀取某 Repository、但無權修改其 Issue Labels，遷移應如何完成？ → A: 遷移範圍內沒有此類唯讀 Issue；直接遷移全部目標 Issue，全部成功後移除舊 Label 相容支援。
- Q: 遷移要由哪種操作者與入口涵蓋全部目標 Repository？ → A: 使用 Gitea `admin` 帳號作為唯一操作者，從 Portal 管理入口啟動、續跑及驗證；範圍是該帳號可完整列舉並具寫入權的所有目標 Repository。憑證不寫入 Portal 程式或文件。
- Q: 如果同一個 Issue 同時有舊 Label 和對應的新 Label，遷移要怎麼處理？ → A: 新 Label 優先；刪除舊 prefix Label，即使兩者代表的 Status 或動作原因不同也不覆蓋新值。

### Session 2026-09-29

- Q: View Options 的欄位顯示、預設欄序與預設排序要套用到哪些 Issues table？ → A: All repos 與所有 Repository Issues table 共用同一登入帳號的設定。
- Q: Issues URL 已明確包含排序時，應採用 URL 還是 cookie 的預設排序？ → A: URL 明確指定排序時以 URL 為準；缺少排序參數時才採用 cookie 預設值。
- Q: View Options 設定要如何區分不同登入帳號？ → A: 依目前登入帳號區分；切換帳號時使用該帳號自己的設定。
- Q: View Options 的 cookie 設定要在關閉瀏覽器後仍保留嗎？ → A: 保留設定；關閉並重新開啟瀏覽器後仍套用該帳號的偏好。
- 決策：表頭欄位名稱可直接拖曳，不顯示專用拖曳按鈕；欄序不同於已保存順序時，於 View Options 左側顯示「設為預設欄位順序」按鈕，點擊後保存 cookie。View Options 不再編輯欄序。
- 決策：View Options 開啟時先顯示欄位顯示與預設排序兩項入口，選取後再顯示該項設定頁。

### Session 2026-09-29 - Table toolbar behavior (supersedes prior default-sort menu decision)

- 決策：整個表頭欄位區域（包含欄名周圍空白）都可拖曳；未排序欄位不顯示箭頭；View Options 只提供欄位顯示。
- 決策：從表頭更改排序後，若目前欄位或方向不同於已保存預設，工具列顯示「設為預設排序」按鈕。
- 決策：「恢復預設」一次還原欄位顯示、預設欄序、預設排序與目前排序至產品初始值，並同步更新 URL。保存欄序與排序的按鈕小型醒目、可同時顯示，窄視窗可換行。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 掃描與辨識 Issues (Priority: P1)

工程師在 All repos 或單一 Repository 的 Issues 頁面，以表格快速比較 Issue 類型、識別碼、標題、負責人、Status、優先度、日期及建立者，並可從標題開啟 Issue 詳情。

**Why this priority**: 表格取代目前的 Issue 卡片清單，是此功能的主要使用價值。

**Independent Test**: 在兩種工作區載入多筆 Issues，確認每列欄位與來源資料一致，並可開啟正確的 Issue 詳情。

**Acceptance Scenarios**:

1. **Given** 使用者進入 All repos 或 Repository Issues 頁面，**When** Issues 載入完成，**Then** 每筆 Issue 以表格列呈現，表頭依序顯示 Type、Key、Title、Assignee、Status、Priority、Created at、Start Date、Due Date、Author。
2. **Given** All repos 中有不同 Repository 的 Issues，**When** 使用者查看 Key，**Then** Key 包含 Repository owner/name 與 Issue number，且不會因不同 Repository 的相同 number 而混淆。
3. **Given** Issue 的 Type、Priority、Status 或排程日期有缺漏或異常，**When** 該列顯示，**Then** 使用者能辨認缺漏或異常，且表格不以猜測值取代來源狀態。
4. **Given** 使用者以鍵盤操作表格，**When** 焦點移至 Title 連結或可操作表頭，**Then** 使用者可看見焦點並能操作對應功能。

### User Story 2 - 依欄位排序與瀏覽 (Priority: P1)

工程師可依任一欄位排序 Issues，從 Key 遞增的預設順序開始，並透過分頁瀏覽大量結果。

**Why this priority**: 排序與分頁讓使用者能快速定位、比較和逐批檢視 Issue。

**Independent Test**: 使用包含重複欄位值及超過 50 筆資料的結果，操作各表頭、重新載入排序 URL 並翻頁，檢查排序及頁面內容。

**Acceptance Scenarios**:

1. **Given** 使用者首次開啟 Issues 頁面且沒有已保存的個人預設排序，**When** 結果載入，**Then** 所有結果依 Key 遞增排序。
2. **Given** 表格已載入，**When** 使用者啟用任一欄位的排序，**Then** 完整篩選結果依該欄位排序後再分頁，表頭指出目前排序欄位與方向。
3. **Given** 使用者選擇一個排序欄位，**When** 再次啟用該欄位，**Then** 排序方向切換；選擇其他欄位時以遞增方向開始。
4. **Given** 有超過 50 筆符合條件的結果，**When** 使用者瀏覽任一頁，**Then** 該頁最多顯示 50 筆，並可前往有資料的前頁或後頁。
5. **Given** 使用者已設定篩選、排序或頁碼，**When** 重新載入或分享目前頁面 URL，**Then** 相同檢視狀態可還原。
6. **Given** 使用者調整搜尋或篩選條件，**When** 新條件提交，**Then** 結果回到第一頁並套用目前排序。

### User Story 6 - 自訂 Issues 表格檢視 (Priority: P1)

工程師可在 Issues table 右上方開啟 View Options 選擇顯示欄位；直接拖曳整個表頭欄位區域調整目前欄序，並透過工具列按鈕分別保存預設欄序與目前排序。偏好依登入帳號保存，並套用於 All repos 與各 Repository Issues table。

**Why this priority**: 使用者能按自己的工作方式閱讀 Issues，並在之後進入任一 Issues 工作區時保留相同檢視偏好。

**Independent Test**: 修改欄位顯示、欄序與目前排序，分別保存預設欄序及排序，操作恢復預設後檢查 table、URL、cookie，並切換登入帳號確認偏好互相隔離。

**Acceptance Scenarios**:

1. **Given** 使用者在 All repos 或 Repository Issues table，**When** 開啟右上方 View Options，**Then** 顯示欄位顯示設定；Key 與 Title 固定顯示，其餘欄位可切換。
2. **Given** 使用者保存欄位顯示設定，**When** 檢視 table，**Then** Key 與 Title 保持顯示，其他欄位可各自隱藏或顯示。
3. **Given** 使用者拖曳表頭欄位區域（包含欄名周圍空白），**When** 欄序改變，**Then** 只改變目前 table 欄序；新欄序不同於保存值時，工具列顯示「設為預設欄位順序」按鈕，按下後保存此欄序。
4. **Given** 使用者透過表頭變更目前排序，**When** 排序欄位或方向不同於已保存預設，**Then** 工具列顯示「設為預設排序」按鈕，按下後保存目前欄位與方向。
5. **Given** 欄序及排序都尚未保存，**When** 使用者查看工具列，**Then** 兩個保存按鈕都可見且醒目；窄視窗下按鈕可換行、不互相遮擋，並比 View Options 按鈕小。
6. **Given** 使用者已自訂欄位顯示、欄序或預設排序，**When** 按下「恢復預設」，**Then** 欄位全部顯示、欄序還原初始值、預設與目前排序還原為 Key 升冪，且 URL 同步為該排序。
7. **Given** 使用者在 All repos 或任一 Repository Issues table 修改設定，**When** 進入另一個 Issues 工作區，**Then** 兩處都使用同一帳號的設定。
8. **Given** 使用者切換 Portal 登入帳號，**When** 查看 Issues table，**Then** 套用目前帳號自己的設定。
9. **Given** Issues URL 明確包含排序欄位與方向，**When** 頁面載入，**Then** URL 排序優先於 cookie 預設排序；URL 未指定排序時使用 cookie 預設排序。
10. **Given** 使用者直接拖曳 table 表頭欄位區域，**When** 欄位位置改變，**Then** 只改變目前頁面的欄序；保存前重新載入或進入其他 Issues 工作區時仍依已保存預設欄序呈現。

### User Story 3 - 辨認逾期排程 (Priority: P2)

工程師可以在表格中快速辨認尚未關閉且 Due Date 已過的 Issue，同時閱讀其他日期與欄位。

**Why this priority**: 逾期提示能突出需要留意的日期，又不干擾整列資訊判讀。

**Independent Test**: 檢視已逾期、今日到期、未來到期、未設定日期、異常日期及已關閉 Issue 的表格案例。

**Acceptance Scenarios**:

1. **Given** 未關閉 Issue 的 Due Date 早於使用者所在地當日，**When** 顯示 Due Date，**Then** 只有日期文字以醒目顏色呈現並附有火焰圖示，整列維持一般樣式。
2. **Given** Due Date 是今日或未來日期，或 Issue 已關閉，**When** 顯示該列，**Then** Due Date 不使用逾期樣式或圖示。
3. **Given** Due Date 未設定或日期資料異常，**When** 顯示該列，**Then** 使用既有的未設定或異常呈現，不顯示逾期標記。

### User Story 4 - 檢視一致的頁面設計 (Priority: P2)

工程師與設計審查者可在 Storybook 檢視表格及其主要資料與互動狀態，不需連線至 Gitea 才能確認呈現。

**Why this priority**: Storybook 提供可重複檢視的 UI 案例，支援設計審查及表格狀態驗收。

**Independent Test**: 開啟 Issues 表格 Storybook 案例，檢視一般、逾期、缺漏或異常、空結果、載入中及錯誤案例。

**Acceptance Scenarios**:

1. **Given** 審查者開啟 Storybook，**When** 選擇 Issues 表格頁面，**Then** 可檢視代表性資料、排序狀態、逾期提示與空／載入／錯誤狀態。
2. **Given** 審查者調整窄視窗尺寸，**When** 表格寬度超過可用區域，**Then** 欄位仍可透過水平捲動閱讀，且頁面主要內容不被裁切或破版。
3. **Given** 審查者開啟 View Options 與 table toolbar 案例，**When** 檢視欄位顯示、欄序待保存、排序待保存、同時待保存及窄版面，**Then** 可檢視各狀態；欄位重排可拖曳表頭任一處或使用鍵盤完成。

### User Story 5 - 在各檢視使用一致的 Status 語意 (Priority: P1)

工程師在 Issue 清單、詳情、Kanban 與 Gantt 中都以 Status 辨認同一組 Todo、In Progress、Done 狀態；Portal 的程式、契約、設定與使用者介面只使用 Status 稱呼這項狀態概念。

**Why this priority**: 使用同一個 Status 名稱和資料契約可避免不同頁面及跨 Repository 操作對狀態的理解不一致。

**Independent Test**: 在各 Issue 檢視讀取同一筆 Issue，確認 Status 值與轉換結果一致，且現行介面及契約使用 Status 命名。

**Acceptance Scenarios**:

1. **Given** 使用者在 Issues、Kanban、Gantt 或 Issue 詳情查看同一筆 Issue，**When** 該 Issue 的 Status 有效，**Then** 各檢視顯示相同 Status 值。
2. **Given** Portal 讀取或寫入 Todo、In Progress Status，**When** 對應 Gitea Label 被保存，**Then** 使用 `status:` 前綴。
3. **Given** Issue 的 Status 與 Gitea 原生 Open／Closed 不一致，**When** Portal 顯示該 Issue，**Then** 兩者仍可區分，且不以其中一者覆蓋或猜測另一者。
4. **Given** 既有 Issue 使用舊的狀態或轉換原因 Label prefix，**When** 遷移完成，**Then** 狀態與原因資料均由新的 Status prefix 表示，轉換原因內容仍可讀取。
5. **Given** 遷移遇到可重試的 Gitea 寫入錯誤，**When** 該 Issue 的 Label replacement 未成功，**Then** 該 Issue 不留下部分替換，使用者能看到失敗並重試，舊 Label 讀取支援維持啟用。
6. **Given** 範圍內所有 Issue 的狀態及轉換原因 Labels 均完成遷移並驗證，**When** 切換完成，**Then** Portal 停止讀取及寫入舊 prefix，現行產品程式、契約、設定、翻譯與維護文件統一使用 Status 命名。
7. **Given** 遷移由 Gitea `admin` 操作者啟動，**When** Portal 掃描遷移範圍，**Then** 只處理該帳號有權存取的目標 Repository，並顯示逐 Issue 結果；範圍讀取不完整或仍有失敗時不得宣告遷移完成。
8. **Given** Issue 同時有舊與新 prefix Label，**When** 兩者值不同，**Then** 保留新 prefix Label、移除舊 prefix Label，並在管理入口明確回報舊值與保留的新值，不以舊值覆蓋新值。

### Edge Cases

- 相同 Key 以外的排序值相同時，列順序仍須穩定；缺值排序時未設定值固定排在有值項目之後。
- 日期欄位以日曆日期比較，不因時區轉換而前後偏移。
- 空結果、載入中及讀取失敗須分別呈現；All repos 的必要 Repository 或 Issue 讀取失敗時，不得將部分結果呈現為完整清單。
- 排序、篩選或分頁期間發生讀取錯誤時，使用者可辨認錯誤並重試。
- 表格在窄視窗下可以水平捲動；欄位仍可讀取，不以隱藏必要資訊取代。
- 隱藏欄位時 Key 與 Title 仍固定顯示；欄序、欄位顯示或預設排序偏好無效或缺漏時，使用者仍可載入預設 Issues table。
- 使用者可直接拖曳表頭欄位名稱調整欄序；鍵盤使用者在排序表頭按鈕上以 Shift+Space 抓取、左右方向鍵移動、Space 放下，或按 Esc 取消。互動狀態須有明確焦點、位置回饋與重排動態效果，並尊重減少動態效果偏好。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Issues 清單 MUST 在 All repos 與 Repository 工作區以表格呈現。
- **FR-002**: 表格 MUST 提供 Type、Key、Title、Assignee、Status、Priority、Created at、Start Date、Due Date、Author 欄位。首次載入的預設欄序 MUST 為 Type、Key、Title、Assignee、Status、Priority、Start Date、Due Date、Created at、Author。Type、Status 與 Priority 欄的表頭及資料內容 MUST 水平置中。`Author` MUST 表示建立 Issue 的 Gitea 使用者；`Title` MUST 表示 Issue 標題。
- **FR-003**: Key MUST 以 `owner/repo#number` 呈現，並可用於識別與開啟對應 Issue。
- **FR-004**: 表格 MUST 顯示 Gitea Issue 資料及由既有 Gitea 資料推導的 Type、Priority、Status 與 Start Date；Status MUST 顯示 Portal 固定三態 Todo、In Progress 或 Done；Gitea MUST 維持唯一資料來源。
- **FR-005**: 使用者 MUST 能依任一表格欄位排序完整的符合條件結果，並能在目前欄位切換遞增與遞減方向。
- **FR-006**: 選擇新的排序欄位時 MUST 以遞增方向排序；未設定個人偏好時，Issues table 的預設排序 MUST 為 Key 遞增。使用者 MUST 能以目前 table 的欄位與方向保存單一預設排序。
- **FR-007**: 排序值相同時 MUST 以 Key 遞增作為穩定次排序；未設定值 MUST 排在有值項目之後，不因排序方向而改變此規則。
- **FR-008**: 篩選與排序 MUST 在分頁前套用；每頁 MUST 最多顯示 50 筆，且提供可操作的前後頁導覽。
- **FR-009**: 搜尋、篩選、排序欄位、方向及目前頁碼 MUST 保留於可分享的頁面 URL；條件變更 MUST 回到第一頁。
- **FR-010**: 尚未關閉且 Due Date 早於使用者所在地當日的 Issue MUST 只在 Due Date 日期文字旁顯示醒目色彩與火焰圖示；不得將逾期樣式套用至整列。
- **FR-011**: 今日到期、未來到期、已關閉、未設定及日期異常的 Issue MUST 不顯示逾期標記，並保留既有的日期與異常呈現語意。
- **FR-012**: 表格 MUST 支援鍵盤操作，提供可辨識的排序狀態、可見焦點及符合目前語系的欄名與控制名稱。
- **FR-013**: 表格 MUST 在窄視窗下保留全部欄位的可讀性與操作能力，不得造成頁面整體版面破裂。
- **FR-014**: Issues 表格 MUST 提供 Storybook 案例，涵蓋主要內容、排序方向、日期標記、缺漏或異常、空結果、載入中、讀取錯誤及窄視窗呈現。
- **FR-015**: 頁面 MUST 保留現有搜尋、篩選、建立 Issue、Issue 詳情導覽與分頁能力。
- **FR-016**: 新增或修改的使用者可見文字 MUST 支援所有現有語系。
- **FR-024**: All repos 與所有 Repository Issues table MUST 在表格右上方提供 View Options；開啟後提供欄位可見性設定。
- **FR-025**: View Options MUST 固定顯示 Key 與 Title，並允許使用者隱藏或顯示其餘欄位。使用者 MUST 能直接拖曳 table 整個表頭欄位區域調整目前欄序，並以表格上方的「設為預設欄位順序」按鈕保存所有欄位的預設順序。
- **FR-026**: View Options 設定 MUST 依目前登入帳號保存，並在該帳號的 All repos 與各 Repository Issues table 共用。
- **FR-027**: URL 明確提供排序欄位與方向時 MUST 優先還原 URL 的排序狀態；URL 沒有有效排序時 MUST 套用 cookie 中已保存的預設排序。
- **FR-028**: View Options 設定 MUST 記錄在 cookie；使用者重新載入頁面後 MUST 還原有效設定。
- **FR-029**: View Options cookie MUST 在關閉並重新開啟瀏覽器後保留有效設定，並依目前登入帳號載入對應偏好。
- **FR-030**: View Options 及新增的表格呈現文字 MUST 支援繁體中文、英文與日文；若 Gitea 對應介面提供相同語意的用字，各語系 MUST 沿用該用字。
- **FR-031**: 欄序重排 MUST 可從整個表頭欄位區域（含欄名周圍空白）拖曳啟動，不得要求專用拖曳按鈕；拖曳後只變更目前欄序，不得自動覆寫保存值。鍵盤替代操作 MUST 在表頭排序按鈕上以 Shift+Space 抓取、左右方向鍵移動、Space 放下、Esc 取消。重排 MUST 使用尊重 `prefers-reduced-motion` 的動畫，不得顯示方向移動按鈕。
- **FR-032**: 只有目前排序欄位 MUST 顯示升冪或降冪箭頭；未排序欄位不得顯示排序箭頭。當目前 table 排序不同於保存的預設排序時 MUST 顯示「設為預設排序」按鈕。
- **FR-033**: 欄序或排序待保存時的工具列按鈕 MUST 使用小型且醒目的樣式；多個待保存按鈕 MUST 可同時顯示並在窄視窗換行。偏好偏離產品初始值時 MUST 提供「恢復預設」按鈕，重設欄位顯示、欄序、預設排序與目前 table 排序，並同步更新 URL。
- **FR-017**: Portal MUST 將 Todo、In Progress、Done 這組 Issue Status 作為唯一產品概念名稱；程式識別字、API 契約、設定、翻譯、樣式及維護中的文件 MUST 使用 Status 命名，不得保留舊概念名稱。
- **FR-018**: Gitea MUST 繼續作為 Issue Status 的唯一來源；Todo 與 In Progress 的 Gitea Label 前綴 MUST 使用 `status:`，Done MUST 維持以 Gitea Closed state 表示。
- **FR-019**: Issue Status MUST 與 Gitea 原生 Open／Closed state 分開表示；Portal MUST 保留 Todo／In Progress 對應 Open、Done 對應 Closed 的既有規則。
- **FR-020**: Portal MUST 將既有 Todo／In Progress 狀態 Labels 遷移至 `status:`，並將既有轉換原因 Labels 遷移至 `status-action:`；遷移期間 MUST 讀取新舊 prefix。新 prefix 已存在時 MUST 保留新值並移除舊 prefix，即使兩者語意不同也不得以舊值覆蓋新值；管理入口 MUST 明確回報被移除的舊值及保留的新值。
- **FR-021**: Label 遷移 MUST 使用目前使用者的 Gitea 權限，逐 Issue 原子更新，並提供可重試的失敗結果；只要仍有未遷移 Issue，Portal MUST 保留舊 prefix 讀取相容性。遷移確認完成後 MUST 移除相容讀取及產品中的舊詞彙。
- **FR-022**: 遷移 MUST 保留 Todo／In Progress 對應 Gitea Open、Done 對應 Gitea Closed 的語意；MUST NOT 新增 `status:done` Label。
- **FR-023**: Status Label 遷移 MUST 僅由 Gitea `admin` 帳號透過 Portal 管理入口啟動、續跑及驗證；遷移清單 MUST 完整列舉該帳號範圍內的目標 Repository 與全部 Issues，並逐項呈現成功、失敗及衝突。Portal MUST 使用該帳號目前登入的 Gitea 權限，MUST NOT 保存或使用其密碼或其他持久憑證。

### Key Entities *(include if feature involves data)*

- **Issue 列**：Gitea Issue 在表格中的呈現資料，包含 Repository 身分、number、標題、建立時間、建立者、指派對象、Gitea state、Labels 衍生值與排程日期。
- **排序狀態**：目前排序欄位及遞增／遞減方向；預設為 Key 遞增，並與篩選、頁碼共同識別可分享的清單檢視。
- **Issues table 偏好**：依登入帳號保存的欄位可見性、預設欄序，以及單一預設排序欄位和方向；Key 與 Title 為固定可見欄位。
- **分頁結果**：依篩選及排序後的 Issue 集合，以每頁最多 50 筆呈現的連續頁面。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 使用者能從表格的 10 個欄位中的任一欄位啟動排序，並能辨認目前欄位及方向。
- **SC-002**: 預設載入結果依 Key 遞增排列；任一頁面最多包含 50 筆 Issue。
- **SC-003**: 在提供的 Storybook 案例中，已逾期、未逾期、已關閉、未設定及異常日期均呈現符合規則的視覺狀態。
- **SC-004**: 使用者可用鍵盤操作表頭排序、分頁及 Issue 詳情連結，且焦點位置清楚可見。
- **SC-005**: 在窄視窗中，全部 10 欄仍可藉由表格區域水平捲動讀取及操作。
- **SC-006**: 頁面重載或分享 URL 後，篩選、排序及頁碼與 URL 記錄一致。
- **SC-007**: 遷移完成後，所有可寫入 Issue 的狀態及轉換原因均使用新 Label prefix，且 Portal 的維護中程式、契約、設定、翻譯及文件一致使用 Status 名稱。
- **SC-008**: 使用者可在 View Options 設定其餘 8 欄的可見性，並由 table toolbar 保存預設欄序及目前欄位排序；設定重新載入後仍能還原。
- **SC-009**: 同一登入帳號的設定在 All repos 與所有 Repository Issues table 一致；切換帳號後不會套用其他帳號的偏好。
- **SC-010**: View Options 的所有新增文字均能在三種支援語系中顯示，且與 Gitea 相同語意的介面用字一致。
- **SC-011**: 欄序與排序同時待保存時兩個操作按鈕皆可見；恢復預設後 table、URL 與 cookie 設定一致。

## Assumptions

- `Status` 欄顯示 Portal 固定三態 Todo、In Progress、Done；不顯示 Gitea Open／Closed state。
- 全域 Status 改名及既有 Gitea Label 遷移屬於本功能範圍；舊 feature 規格保留作為歷史記錄。
- `Author` 欄表示建立 Issue 的 Gitea 使用者；`Created at` 顯示 Issue 建立時間。
- Key 使用 `owner/repo#number`，字典序遞增為未設定個人偏好時的預設排序。
- View Options 偏好由登入帳號區分，All repos 與 Repository Issues table 共用；明確的 URL 排序狀態優先於偏好中的預設排序。
- View Options cookie 跨瀏覽器重新啟動保留；表頭欄位名稱可直接拖曳排序並提供鍵盤操作替代；欄序不同於預設時顯示保存按鈕，重排動畫尊重減少動態效果設定。
- View Options 的 UI 設計採用 `$ui-styling` 與 `$ui-ux-pro-max`，並以 Storybook 檢視和驗收主要互動狀態。
- 逾期判斷採使用者所在地的日曆日期；已關閉 Issue 不視為逾期。
- 狀態遷移只修改指定的狀態與轉換原因 Labels；一般 Labels、Assignee、Milestone、Gitea Open／Closed state 及其他 Issue 資料均保留。
- 遷移使用目前登入者的 Gitea 權限，不使用較高權限的服務身份；範圍內所有目標 Issue 均可由目前使用者更新。技術失敗可重試，全部遷移成功前不得移除舊 Label 相容支援。
- 不新增 Portal Issue 持久化；Gitea 維持 Issue Status 與 Label 的唯一資料來源。
