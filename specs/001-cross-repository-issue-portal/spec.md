# Feature Specification: 跨 Repository Gitea Issue 管理 Portal

**Feature Branch**: `001-cross-repository-issue-portal`

**Created**: 2026-09-20

**Status**: Draft

**Input**: User description: 建立一個供內網使用的 Gitea 跨 Repository Issue 管理 Web Portal。

## Clarifications

### Session 2026-09-20

- Q: Kanban Board 的工作狀態在第一版應如何表達？ → A: 使用可設定的 Gitea Label 對應 Board 欄位；Board 狀態變更即更新對應 Label。
- Q: Portal 的 Repository 管理範圍應如何決定？ → A: 第一版顯示使用者有權存取的所有 Repository，並保留未來加入全域納管 Repository 清單的彈性。
- Q: Gitea Label 與 Kanban Board 欄位的對應設定應套用在哪個範圍？ → A: Board 選擇一套既有的 Workflow Convention；Repository 必須使用相同 Convention 才能加入，取代每個 Board 個別定義 Label mapping。
- Q: Kanban Board 在第一版應是個人使用，還是能與其他團隊成員共享？ → A: 第一版只支援共享 Board；共享 Board 仍受每位使用者的 Gitea 權限限制。
- Q: 當使用者把 Card 移到另一個 Kanban 狀態時，Portal 應如何處理原本的狀態 Label？ → A: 維持單一狀態 Label，移除同一 Board 定義的其他狀態 Labels，再加入目標狀態 Label；任一步更新失敗則維持原狀。

- Q: 誰可以查看、修改與刪除共享 Kanban Board 的設定？ → A: 不建立 Board owner / member 資料；所有可使用 Portal 的使用者都能查看與修改共享 Board 設定，Issue 內容與操作仍逐筆遵守 Gitea 權限。
- Q: Portal 是否可以保存 Kanban Board 的設定資料，例如 Board 名稱、類型、Repository 範圍與 Label 對應？ → A: 保存 Board 設定資料，但不保存 Issue 副本、owner 或 member 資料；Issue 與狀態仍以 Gitea 為唯一來源。
- Q: 在不建立 Board owner / member 資料的前提下，個人 Board 應如何保存與辨識？ → A: 移除個人 Board，第一版只支援所有可使用 Portal 的使用者共享的 Board。
- Q: 共享 Kanban Board 的 Repository 範圍應如何設定？ → A: 每個 Board 可選擇要納入的多個 Repository；使用者只看到自己有權限的 Issues。
- Q: 當共享 Board 選定的某個 Repository 缺少 Board 所需的狀態 Label 時，應如何處理該 Repository 的 Issues？ → A: Board 只允許加入使用相同 Workflow Convention 的 Repository；缺少某個狀態 Label 的 Issue 顯示為「未設定狀態」，多個同一 Convention Labels 則顯示為「狀態衝突」，Portal 不自動猜測。
- Q: 第一版的 Workflow Convention 應由誰、透過什麼方式建立與修改？ → A: 由集中設定提供 Workflow Convention；第一版 Portal 只讀取與套用，不提供 Convention 編輯介面。
- Q: Repository 與 Workflow Convention 的對應關係應如何提供？ → A: 在集中設定中明確指定每個 Repository 使用的 Convention；Portal 不根據 Issue Labels 自動推測。
- Q: 一個 Repository 在第一版應只能指定一套 Workflow Convention，還是可以同時指定多套？ → A: 一個 Repository 只能指定一套 Workflow Convention。
- Q: 集中設定中的 Workflow Convention 被修改後，既有 Board 應如何處理？ → A: Workflow Convention 使用版本；既有 Board 固定引用原版本，新 Board 才能選用新版。
- Q: 當 Board 狀態 Label 更新失敗時，是否必須保證 Issue 最終維持原本的 Labels？ → A: 必須維持原狀；Board 狀態轉移必須以單一原子操作替換同一 Convention 的狀態 Labels；若無法保證，Portal 應在修改前拒絕操作，不允許部分更新。
- Q: Workflow Convention 是否只需固定必要語意欄位，而保留 prefix/namespace 的實際字串格式彈性？ → A: 是。Convention 必須提供 ID、版本、狀態 key/名稱、狀態順序與對應的 exact Gitea Label name；prefix/namespace 的實際格式留給後續實作決定。
- Q: 第一版是否應移除未定義的 Board type，只保存 Board 名稱、Repository 範圍與 Workflow Convention 版本？ → A: 是。第一版只支援已定義的共享 Kanban Board 設定，不建立額外 Board type 欄位。
- Q: SC-002、SC-003、SC-005 與 SC-008 是否保留為產品成功標準，並於後續驗收階段量測，而不要求第一版建立完整使用者研究或統計系統？ → A: 是。第一版提供可執行的功能情境與必要操作證據，正式使用者成效量測留給後續驗收規劃。
- Q: 第一版是否要求無障礙與 responsive 使用，但不要求多語系？ → A: 是。第一版 MUST 支援主要互動的鍵盤操作與適合內網瀏覽器尺寸的 responsive layout；第一版不要求 localization 或多語系切換。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 統一瀏覽與篩選 Issues (Priority: P1)

工程師從 Portal 單一入口查看其有權存取的多個 Repository Issues，並透過 Repository、狀態、Assignee、Label、Milestone 及關鍵字縮小工作範圍。

**Why this priority**: 跨 Repository 統一查看與搜尋是 Portal 的核心價值，也是取代逐一進入 Repository 的最基本能力。

**Independent Test**: 準備至少兩個可存取的 Repository 與具有不同屬性的 Issues；使用者可在單一入口看見來源 Repository，套用一個或多個條件並得到符合結果。

**Acceptance Scenarios**:

1. **Given** 使用者有權查看兩個 Repository，且兩者各有 Issues，**When** 使用者開啟 Issue 清單，**Then** 清單顯示所有納入範圍且使用者有權查看的 Issues，並清楚顯示 Repository、Issue Number、Title、State、Assignee、Labels、Milestone 與 Updated Time。
2. **Given** Issue 清單包含不同 Repository、狀態與 Labels 的 Issues，**When** 使用者同時指定 Repository、Open / Closed State、Assignee、Label 或 Milestone 條件，**Then** 結果只包含符合全部已指定條件的 Issues。
3. **Given** 使用者輸入關鍵字，**When** 使用者執行搜尋，**Then** Portal 顯示跨 Repository 的符合 Issues，且每筆結果仍保留來源 Repository 識別資訊。
4. **Given** 使用者沒有某 Repository 的存取權，**When** 使用者查看清單或搜尋，**Then** 該 Repository 的 Issue 不會顯示，也不會因搜尋結果洩漏其存在或內容。

### User Story 2 - 查看 Issue 詳情與回到 Gitea (Priority: P1)

工程師開啟任一跨 Repository Issue，查看完整內容、Comments 與原生 Gitea 資訊，必要時前往原始 Gitea Issue。

**Why this priority**: Portal 必須讓使用者能完成日常判讀，同時保留 Gitea 作為正式管理介面的角色。

**Independent Test**: 從跨 Repository 清單開啟 Issue，確認詳情與 Comments 可讀，並能開啟對應的 Gitea Issue 頁面。

**Acceptance Scenarios**:

1. **Given** 使用者從清單選擇一筆 Issue，**When** 使用者開啟詳情，**Then** Portal 顯示 Repository、Issue Number、Title、Description、State、Assignee、Labels、Milestone、Updated Time 與 Comments。
2. **Given** Issue 有多筆 Comments，**When** 使用者查看詳情，**Then** Comments 依時間順序顯示作者與內容，且不會與其他 Repository 的 Issue 混淆。
3. **Given** 使用者正在查看一筆可存取的 Issue，**When** 使用者選擇前往原始 Gitea Issue，**Then** Portal 開啟該 Repository 中正確 Issue 的 Gitea 頁面。

### User Story 3 - 從 Portal 建立與編輯 Gitea Issue (Priority: P1)

工程師選擇 Repository 後建立新的 Gitea Issue，或直接修改既有 Issue 的 Title、Description、State、Assignee、Labels 與 Milestone。

**Why this priority**: Portal 不只是閱讀介面，必須支援跨 Repository 的日常工作更新，且結果必須成為正式 Gitea Issue 資料。

**Independent Test**: 在有權限的 Repository 建立 Issue，再修改其欄位並重新查看 Gitea；確認所有變更都反映在同一筆 Gitea Issue。

**Acceptance Scenarios**:

1. **Given** 使用者有權在某 Repository 建立 Issue，**When** 使用者填寫 Title、Description 及可用的 Issue 資訊並送出，**Then** 該 Repository 建立一筆正式 Gitea Issue，Portal 顯示其 Issue Number 與最新內容。
2. **Given** 使用者有權修改某 Issue，**When** 使用者更新 Title、Description、Assignee、Labels 或 Milestone，**Then** Portal 顯示成功結果，且重新開啟該 Issue 時仍可看見更新後資料。
3. **Given** 使用者執行 Close 或 Reopen，**When** 操作成功，**Then** Issue 的 State 在 Portal 與 Gitea 都反映相同結果。
4. **Given** 使用者沒有建立或修改權限，**When** 使用者嘗試執行相應操作，**Then** Portal 拒絕操作並不改變 Gitea Issue。

### User Story 4 - 管理 Comments (Priority: P1)

工程師在 Portal 查看既有 Comments，並直接新增 Comment 到對應的 Gitea Issue。

**Why this priority**: Comments 是 Issue 協作的原生資訊，不能因使用 Portal 而分裂成另一份討論紀錄。

**Independent Test**: 在可修改的 Issue 上新增 Comment，從 Portal 與 Gitea 分別查看，確認內容、作者與所屬 Issue 一致。

**Acceptance Scenarios**:

1. **Given** 使用者有權在 Issue 新增 Comment，**When** 使用者提交非空 Comment，**Then** Comment 出現在該 Issue 的 Portal 與 Gitea 內容中。
2. **Given** 使用者沒有權限新增 Comment，**When** 使用者提交 Comment，**Then** Portal 顯示拒絕結果，且不產生部分或重複 Comment。

### User Story 5 - 跨 Repository Kanban 管理 (Priority: P1)

團隊在同一個共享 Kanban Board 查看來自不同 Repository 的 Issues，所有可使用 Portal 的使用者都能查看與修改 Board 設定，並透過移動 Card 改變 Issue 所代表的工作狀態。

**Why this priority**: 統一工作流是跨 Repository Portal 相對於 Gitea 單一 Repository 介面的主要增值能力，共享 Board 支援團隊協作。

**Independent Test**: 建立至少包含兩個 Repository Issues 的 Board，移動一張 Card，確認其工作狀態在 Portal 與 Gitea 可保存的 Issue 資訊中一致。

**Acceptance Scenarios**:

1. **Given** Board 範圍內有多個 Repository 的 Issues，**When** 使用者開啟 Board，**Then** 所有 Card 清楚顯示 Repository、Issue Number、Title、Assignee 與 Labels。
2. **Given** 使用者有權修改某 Issue 的工作狀態，**When** 使用者將 Card 移至另一個工作狀態欄位，**Then** 對應 Issue 的 Gitea 可保存資訊被更新，重新整理 Board 後 Card 仍位於新狀態。
3. **Given** 使用者沒有權修改某 Issue，**When** 使用者嘗試移動該 Card，**Then** 操作被拒絕，Card 與 Issue 維持原狀。
4. **Given** 一筆 Issue 從 Gitea 直接被修改，**When** 使用者之後重新查看 Board，**Then** Board 反映 Gitea 的最新可用狀態，而不以 Portal 內部狀態覆蓋 Gitea。

### User Story 6 - 以 Labels 表達工作管理分類 (Priority: P2)

團隊可以定義自己的 Workflow Convention，以具有可辨識 prefix 或 namespace 的 Labels 表達工作狀態；Portal 不強制所有團隊使用同一套 Workflow。其他非 Workflow Labels，例如 Priority、Team 或一般分類，仍可獨立使用。

**Why this priority**: 不同團隊可使用不同工作流，同時維持 Board 與 Repository 的明確相容性；非 Workflow Labels 不應被誤判為工作狀態。

**Independent Test**: 建立兩套不同 Workflow Convention，確認 Board 只接受相同 Convention 的 Repository，並正確處理未設定狀態與狀態衝突。

**Acceptance Scenarios**:

1. **Given** Issue 具有可識別的工作管理 Labels，**When** 使用者查看清單、詳情或 Board，**Then** Portal 以一致方式顯示這些 Labels。
2. **Given** 使用者選擇某個 Label 作為篩選條件，**When** 使用者執行篩選，**Then** 只顯示具有該 Label 的可存取 Issues。
3. **Given** Board 與 Repository 使用相同 Workflow Convention 版本，**When** 使用者開啟 Board，**Then** Repository 可加入該 Board，且 Board 依該版本的狀態集合與順序顯示欄位。
4. **Given** Board 與 Repository 使用不同 Workflow Convention 或版本，**When** 使用者嘗試將 Repository 加入 Board，**Then** Portal 拒絕加入並清楚顯示不相容原因。
5. **Given** Repository 使用相同 Convention 但某 Issue 沒有任何 Workflow Label，**When** 使用者查看 Board，**Then** 該 Issue 顯示為「未設定狀態」。
6. **Given** Issue 同時具有同一 Convention 的多個 Workflow Labels，**When** 使用者查看 Board，**Then** 該 Issue 顯示為「狀態衝突」，Portal 不自動猜測或覆蓋狀態。
7. **Given** Issue 具有非 Workflow Labels，例如 `priority:high`、`team:frontend` 或 `bug`，**When** Portal 判定 Workflow 狀態，**Then** 這些 Labels 不影響 Workflow 相容性與狀態判定。

### Edge Cases

- Gitea 中的 Issue 在 Portal 清單開啟後已被其他使用者修改；Portal 應顯示最新結果，若更新衝突則清楚告知使用者且不得靜默覆蓋較新的資料。
- Gitea 暫時無法回應時，Portal 應清楚顯示資料目前無法取得或操作未完成；不得把未成功的變更呈現為已成功。
- Board 狀態 Label 不存在、無法套用或移除時，Portal 應將整個狀態變更視為失敗，維持 Issue 原有的狀態 Labels，且不得顯示為已移動成功。
- Board 狀態轉移只有在 Portal 能保證移除舊狀態與加入新狀態為單一原子結果時才可執行；若無法保證，Portal 必須在修改前拒絕操作，不得留下部分更新。
- Board 與 Repository 的 Workflow Convention 不相容時，Repository 不得加入該 Board；Repository 缺少某個 Convention 狀態 Label 的定義時，也不得視為相容。
- Issue 沒有 Workflow Label 時，Board 應顯示「未設定狀態」；Issue 同時擁有多個同一 Convention Workflow Labels 時，應顯示「狀態衝突」，不得自動選擇其中一個。
- Issue、Repository、Assignee、Label 或 Milestone 在操作期間已被刪除、停用或撤銷權限；Portal 應以 Gitea 的最新權限與資料為準。
- 使用者送出缺少必要內容的建立、編輯或 Comment 操作時，Portal 應指出具體欄位問題，且不建立不完整資料。
- 同一 Issue 同時出現在清單與 Board 時，兩處應指向同一筆 Gitea Issue，不得產生複製 Card 或 Portal 專屬 Issue。
- 使用者對不同 Repository 使用相同 Issue Number 時，Portal 必須以 Repository 與 Issue Number 的組合識別 Issue。
- Issue 的 Label、Assignee 或 Milestone 清單為空時，Portal 應允許正常查看與管理其他可用欄位。
- Issue 被 Gitea 直接刪除或使用者失去權限後，Portal 不應繼續顯示可操作的過時資料。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Portal 第一版 MUST 顯示使用者有權存取的所有 Repository Issues；規格 MUST 保留未來限制為全域納管 Repository 清單的彈性。
- **FR-002**: Portal MUST 讓使用者辨識每筆 Issue 的 Repository、Issue Number、Title、State、Assignee、Labels、Milestone 與 Updated Time。
- **FR-003**: Portal MUST 支援跨 Repository 關鍵字搜尋。
- **FR-004**: Portal MUST 支援依 Repository、Open / Closed State、Assignee、Label 與 Milestone 篩選 Issues。
- **FR-005**: Portal MUST 允許使用者組合多個搜尋與篩選條件，並只顯示同時符合條件的結果。
- **FR-006**: Portal MUST 顯示 Issue 詳情與其 Comments，並清楚區分作者、時間與內容。
- **FR-007**: Portal MUST 提供前往對應原始 Gitea Issue 的明確入口。
- **FR-008**: Portal MUST 讓具備相應 Gitea 權限的使用者選擇 Repository 並建立正式 Gitea Issue。
- **FR-009**: Portal MUST 支援修改 Gitea Issue 的 Title、Description、State、Assignee、Labels 與 Milestone，實際支援範圍以該使用者與 Repository 的 Gitea 權限為準。
- **FR-010**: Portal MUST 支援 Close、Reopen 與新增 Comment，且結果 MUST 反映在對應 Gitea Issue。
- **FR-011**: Portal MUST 提供可同時包含不同 Repository Issues 的共享 Kanban Board；每個 Board MUST 能保存一組選定的多個 Repository；Board MUST 對所有可使用 Portal 的使用者可見。
- **FR-011a**: Portal MUST NOT 建立或依賴 Board owner / member 資料；所有可使用 Portal 的使用者都能修改或刪除共享 Board 設定。
- **FR-011b**: Portal MAY 保存 Board 名稱、Repository 範圍與 Board 所選 Workflow Convention 版本等設定資料，但 MUST NOT 保存 Board type 欄位、Gitea Issue 副本或以 Portal 設定取代 Gitea Issue 資料。
- **FR-012**: Kanban Card MUST 顯示 Repository、Issue Number、Title、Assignee 與 Labels，並能開啟對應 Issue 詳情。
- **FR-013**: Portal MUST 讓具備相應 Gitea 權限的使用者透過 Board 改變 Issue 所代表的工作狀態。
- **FR-014**: Board MUST 選擇一套既有的 Workflow Convention，並依該 Convention 的狀態集合與順序顯示 Board 欄位；Portal MUST 不強制所有團隊使用同一套 Convention。使用者移動 Card 時 MUST 以單一原子操作將同一 Convention 的狀態 Labels 替換為目標狀態 Label，不得以可能留下部分結果的依序更新取代。
- **FR-015**: Repository MUST 只有在使用與 Board 相同的 Workflow Convention 版本時才能加入該 Board；不同 Convention 或版本的 Board 與 Repository MUST NOT 混用。
- **FR-015a**: Workflow Convention MUST 提供可辨識的 Convention ID、版本、狀態 key/名稱、狀態順序與對應的 exact Gitea Label name；prefix 或 namespace 的實際字串格式留給後續規劃階段，但不得影響上述欄位的明確判定。
- **FR-015e**: 第一版 MUST 從集中設定讀取 Workflow Convention；Portal MUST NOT 提供 Convention 建立或修改介面。
- **FR-015f**: 第一版 MUST 從集中設定讀取每個 Repository 指定的 Workflow Convention；Portal MUST NOT 根據 Repository 或 Issue 目前的 Labels 自動推測 Convention。
- **FR-015g**: 第一版每個 Repository MUST 只指定一套 Workflow Convention；同一 Repository 不得以多套 Convention 同時加入不同 Board。
- **FR-015h**: Workflow Convention MUST 具備可被 Board 固定引用的版本；既有 Board MUST 維持原本引用的版本，新 Board 才能選用新版 Convention。
- **FR-015b**: Issue 沒有 Workflow Label 時，Portal MUST 顯示「未設定狀態」；Issue 同時擁有多個同一 Convention Workflow Labels 時，Portal MUST 顯示「狀態衝突」且不得自動猜測。
- **FR-015c**: 非 Workflow Labels MUST 不影響 Workflow Convention 相容性或狀態判定，並仍可作為一般 Issue Labels 顯示與篩選。
- **FR-015d**: Portal MUST 能顯示與篩選 Workflow Labels 及其他 Gitea Labels。
- **FR-016**: Portal MUST 以使用者當下的 Gitea 存取權限限制 Repository、Issue 的查看與修改能力。
- **FR-016a**: 共享 Board MUST 只顯示與允許操作目前使用者有權查看或修改的 Issues；共享 Board 的存在不得擴大任何成員的 Gitea 權限。
- **FR-017**: Portal MUST NOT 讓自身的權限設定繞過使用者原有的 Gitea 權限。
- **FR-018**: Portal MUST 以 Gitea Issue 作為 Issue 主要內容、狀態、Comments、Labels、Assignee 與 Milestone 的唯一 Source of Truth。
- **FR-019**: Portal MUST 在 Gitea 直接修改 Issue 後，於下一次查看或重新整理時反映 Gitea 的最新資料。
- **FR-020**: Portal MUST 對未授權、無法取得資料、更新衝突與操作失敗提供清楚結果，並不得把失敗操作呈現為成功。
- **FR-020a**: Board 狀態 Label 轉移 MUST 以單一原子結果完成；若無法同時移除同一 Convention 的其他狀態 Labels 並加入目標 Label，Portal MUST 在修改前拒絕操作，保持該 Issue 原有狀態 Labels，並將狀態變更回報為失敗。
- **FR-021**: Portal MUST 保持 Issue 與其原始 Repository 的可追溯關係，即使不同 Repository 使用相同 Issue Number。
- **FR-022**: Portal MUST NOT 將 Issue 複製成獨立於 Gitea 的 Portal 專屬工作項目。
- **FR-023**: Portal 第一版 MUST 支援主要互動的鍵盤操作與適合內網瀏覽器尺寸的 responsive layout；第一版 MUST NOT 將 localization 或多語系切換列為必要能力。

### Key Entities

- **Repository**: 可被 Portal 納入管理的 Gitea Repository，包含識別資訊、可見性與使用者可用權限。
- **Gitea Issue**: 儲存在 Gitea 且由 Gitea 作為唯一來源的工作項目，包含 Repository、Issue Number、Title、Description、State、Assignee、Labels、Milestone、Updated Time 與 Comments。
- **Issue Comment**: 附屬於特定 Gitea Issue 的作者、時間與內容紀錄。
- **Kanban Board**: 將多個 Repository 的 Gitea Issues 依工作狀態集中呈現的工作管理視圖。
- **Kanban Card**: Board 中代表一筆實際 Gitea Issue 的視覺化項目，不是另一筆獨立資料。
- **Label-based Metadata**: 透過 Gitea Labels 表達 Workflow 狀態、Priority、Team 等分類資訊；非 Workflow Labels 不影響 Workflow 相容性。
- **Workflow Convention**: 團隊定義的 Workflow 狀態集合、順序、可辨識的 Label prefix 或 namespace 與版本；不同 Convention 或不相容版本不可互相混用。
- **Permission Context**: 使用者在 Gitea 對特定 Repository 與 Issue 可執行的查看、建立、修改、Comment 或狀態操作能力。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 使用者可在單一 Portal 入口完成跨至少 3 個 Repository 的 Issue 查看、搜尋與複合篩選，不需逐一進入 Repository 頁面。
- **SC-002**: 至少 90% 的受測使用者可在第一次嘗試中，於 2 分鐘內找到指定 Repository、State、Assignee、Label 或 Milestone 條件下的目標 Issue。
- **SC-003**: 至少 90% 的受測使用者可在 3 分鐘內從 Portal 完成一筆 Issue 的建立或既有 Issue 的修改，並在 Gitea 中確認結果。
- **SC-004**: 至少 95% 的成功 Issue 操作在 Portal 完成後，於使用者重新查看時呈現與 Gitea 一致的 Title、State、Assignee、Labels、Milestone、Comments 與工作狀態。
- **SC-005**: 至少 90% 的受測使用者可在 1 分鐘內辨識 Kanban Card 所屬的 Repository 與 Issue Number，並開啟正確的原始 Gitea Issue。
- **SC-006**: 100% 的權限驗收情境中，使用者無法透過 Portal 查看或修改其 Gitea 權限範圍外的 Repository 或 Issue。
- **SC-007**: Portal 不可用或未被使用時，Issue 的主要內容、原生狀態、Comments、Labels、Assignee、Milestone 與 Board 所需工作狀態仍可從 Gitea 直接取得。
- **SC-008**: 受測工程團隊完成日常跨 Repository Issue 管理任務時，至少 80% 的任務不需要切換至其他 Repository 的 Issue 清單頁面。

## Assumptions

- 使用者已具備可被 Gitea 識別的身分；如何建立工作階段、登入或整合既有內網身份系統留給後續規劃階段。
- Gitea 是現有且持續運作的 Issue 管理系統；Portal 不負責取代 Gitea 的 Git Hosting、Pull Request、Code Review、CI/CD 或 Repository 管理能力。
- Portal 第一版的管理範圍包含使用者有權存取的所有 Repository；未來可增加全域納管 Repository 清單，但任何 Portal 自有設定都不能擴大 Gitea 授權範圍。
- Portal 不強制所有團隊使用同一套 Workflow Convention。Board 選擇一套有版本的 Convention，Repository 必須使用相同 Convention 版本才能加入；Repository 只要有完整的 Convention Label 定義即可，即使目前沒有任何 Issue 使用其中某個狀態 Label。第一版由集中設定提供 Convention 與 Repository 對應，且每個 Repository 只指定一套 Convention；Portal 只讀取與套用。既有 Board 固定引用原版本，新 Board 才能選用新版；prefix 格式留給後續規劃。
- Board 第一版只支援共享 Board，不建立 Board owner / member 資料。Board 對所有可使用 Portal 的使用者可見且可修改設定，但其中 Issue 的可見與可操作內容仍依每位使用者當下的 Gitea 權限判定。
- 每個共享 Board 可保存一組選定的多個 Repository；使用者在同一 Board 上只看到自己對這些 Repository 有權查看的 Issues。
- Portal 可保存 Board 設定資料，但不得保存 Issue 副本或以 Board 設定取代 Gitea Issue 的主要資料。
- 第一階段不包含 Epic、Parent / Child Issue、Issue dependency graph、Story Points、Resource planning、Time tracking、Gantt Chart、Roadmap、Custom Fields 或自訂 Workflow Engine。
- 第一階段不建立獨立的 Issue Database 或 Portal 專屬 Issue；若未來需要額外 Portal 設定，仍不得取代 Gitea Issue 的主要資料。
- Success Criteria 中的時間、比例與規模是產品成功標準；第一版以 quickstart 功能情境與必要操作證據支援後續驗收，正式使用者研究、抽樣與統計量測留給後續驗收規劃。
