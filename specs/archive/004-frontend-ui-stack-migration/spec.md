# Feature Specification: 前端 UI 技術棧遷移

**Feature Branch**: `004-frontend-ui-stack-migration`

**Created**: 2026-09-24

**Status**: Draft

**Input**: User description: "安裝最後推薦的 Tailwind CSS、shadcn/ui、Chart.js、Storybook，並且把現在的功能替換成新的套件；舊的呈現方式都可以打掉，視為一開始沒有選好相關套件的技術還債。"

## Scope Boundaries

本功能是前端呈現層的技術還債與 UI 統一遷移，不是新增 Issue 管理能力。

包含：

- 導入 Tailwind CSS、shadcn/ui、Chart.js 與 Storybook。
- 將目前已存在的 Portal 頁面與互動元件改用新的 UI 呈現方式。
- 移除已被完整取代、且不再承擔資料或行為責任的舊呈現樣式與元件。
- 以新 UI framework 的元件結構、token、狀態與可及性模式為優先；目前 Issue、Comment、Board、Kanban、Workflow 的部分操作在初始遷移中可以暫時不完整，後續再依新框架重新設計補齊。

不包含：

- 新增 Dashboard、統計圖表頁面或其他新的產品功能；Chart.js 先作為核准的視覺化基礎，未來功能再使用。
- 修改 Gitea Issue、Comment、Label、Assignee、Milestone 或狀態的資料規則。
- 修改 Gitea 權限、Authentication、API contract、Board JSON schema、atomic write 或並行寫入保護。
- 建立新的獨立 Issue 資料來源或將 Gitea 資料複製到前端持久化儲存。
- 以初始遷移一次完成所有既有功能 parity 為完成門檻；功能落差可以列為後續工作，但不得改變資料來源、權限與持久化邊界。

## Clarifications

### Session 2026-09-24

- Q: 這次 UI 遷移是否允許重新設計現有頁面的版面與互動呈現，只要不改變既有功能、資訊語意與 Gitea/Board 行為？ → A: 允許重新設計視覺、版面與互動呈現；保留既有功能、資訊語意、路由與資料行為。
- Q: 如果新 framework 的元件模型與既有功能行為衝突，本輪完成門檻應優先保留哪一方？ → A: 新 framework 優先；既有功能可以暫時無法完成，後續再依新 framework 重新設計補齊，但不得新增第二套 Issue 資料來源或突破 Gitea 權限邊界。

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 以新版介面瀏覽跨 Repository Issues (Priority: P1)

工程師進入 Portal 後，可以使用新版介面查看跨 Repository Issue 清單，辨識 Repository、Issue number、Title、State、Assignee、Labels、Milestone 與 Updated Time；搜尋、篩選與分頁會以新 framework 的互動模式重新設計，初始遷移不以完整 parity 為硬性門檻。

**Why this priority**: Issue 清單是 Portal 最主要的日常入口，必須先完成遷移且不能犧牲既有跨 Repository 管理能力。

**Independent Test**: 使用包含多個 Repository、不同狀態、Assignee、Labels 與 Milestone 的測試資料開啟 Issues 頁面，確認新版元件、token、狀態與響應式 layout 可以獨立呈現；功能落差可記錄為後續工作。

**Acceptance Scenarios**:

1. **Given** 使用者可取得多個 Repository 的 Issues，**When** 開啟 Issues 頁面，**Then** 所有既有必要欄位以一致的新 UI 呈現，且每筆 Issue 清楚顯示來源 Repository。
2. **Given** 使用者輸入搜尋字串並設定多個篩選條件，**When** 送出篩選，**Then** 頁面仍依既有規則取得並呈現符合條件的 Issues。
3. **Given** Issue 清單正在載入、沒有結果或發生 Gitea/API 錯誤，**When** 使用者查看頁面，**Then** 會看到新版介面中的明確 Loading、Empty 或 Error 狀態，而不是空白或破版。

### User Story 2 - 使用新版介面完成 Issue 生命週期操作 (Priority: P1)

工程師可以透過新版介面看到建立 Issue、詳細內容、編輯、狀態、Assignee、Labels、Milestone 與 Comments 所需的新版元件與頁面結構；初始遷移允許部分操作暫時不完整，後續以新 framework 補齊。

**Why this priority**: UI 遷移不能降低 Portal 原本對 Gitea Issue 的日常操作能力。

**Independent Test**: 以虛構資料檢查建立、編輯、狀態與 Comment 的新表單/狀態呈現；確認保留的操作仍使用 Gitea API，不要求初始遷移一次完成所有 lifecycle parity。

**Acceptance Scenarios**:

1. **Given** 使用者位於建立 Issue 頁面，**When** 填寫 Repository、Title、Description 與可選欄位並送出，**Then** 新 Issue 建立成功，並導向可查看該 Issue 的新版詳細頁面。
2. **Given** 使用者開啟既有 Issue detail，**When** 進入編輯並儲存修改，**Then** 新版表單顯示成功或失敗結果，且重新載入後資料與 Gitea 一致。
3. **Given** 使用者在 Issue detail 新增 Comment，**When** 送出有效內容，**Then** Comment 顯示於新版 Comment 區域，且重新載入後仍存在。
4. **Given** 使用者沒有修改該 Issue 的 Gitea 權限，**When** 嘗試執行受限操作，**Then** 新版 UI 顯示可理解的權限或操作失敗訊息，不會假裝成功。

### User Story 3 - 使用新版介面管理 Board 與 Kanban (Priority: P1)

工程師可以透過新版介面看到 Board、Repository picker、Workflow Convention 與 Kanban 的新元件結構；既有 Board 操作可在初始遷移中暫時不完整，但後續不得新增獨立 Card 狀態來源。

**Why this priority**: Kanban 是本 Portal 的核心差異化能力，不能因 UI 技術還債而失去 Workflow Label、狀態修復與拖曳轉換行為。

**Independent Test**: 使用虛構 Board/Card 資料檢查新版欄位、Card、Repository、Issue number、Title、Assignee、一般 Labels 與異常資訊呈現；transition parity 可列為後續工作。

**Acceptance Scenarios**:

1. **Given** Board 包含多個 Workflow 狀態欄位與跨 Repository Cards，**When** 使用者開啟 Board，**Then** 新版 Kanban UI 顯示欄位與 Cards，且 Card 不重複顯示該 Board Convention 的 Workflow Label。
2. **Given** 使用者建立或編輯 Board，**When** 選擇 Workflow Convention 與相容 Repository 並儲存，**Then** Board 設定成功保存，既有相容性驗證規則不變。
3. **Given** Card 具有有效 Workflow 狀態，**When** 使用者拖曳 Card 至另一個有效狀態欄位，**Then** Portal 顯示操作結果，且對應 Gitea Issue 的 Workflow Label 反映新狀態。
4. **Given** Card 的 Workflow 狀態修復失敗或存在異常，**When** 使用者開啟 Board，**Then** 新版 Card 仍清楚顯示錯誤、異常欄位或可重試操作，不會因視覺遷移而隱藏問題。

### User Story 4 - 維護一致且可重用的介面元件 (Priority: P2)

前端開發者可以在隔離的元件展示環境中查看與調整 Portal 的核心 UI 元件，包括 Button、Form、Filter、Issue Row、Issue Card、Label、Loading、Empty、Error、Permission Denied 與 Kanban 元件。

**Why this priority**: 技術還債的目的不只是換外觀，也要降低下一次修改造成不同頁面視覺不一致的風險。

**Independent Test**: 啟動元件展示環境，逐一查看核心元件的正常、載入、空資料、錯誤、停用與互動狀態，確認元件可獨立呈現並與 Portal 使用相同的設計規則。

**Acceptance Scenarios**:

1. **Given** 核心元件存在不同狀態，**When** 開發者在元件展示環境切換狀態，**Then** 每個狀態都可以獨立查看，不需要先啟動 Gitea 或建立真實 Issue。
2. **Given** 同一個元件被多個頁面使用，**When** 調整其新版視覺規則，**Then** 各使用頁面呈現一致，且不需要保留多套互相衝突的舊樣式。

### User Story 5 - 在不同畫面尺寸與輔助操作下使用 Portal (Priority: P2)

工程師可以在常見桌面寬度及較窄的瀏覽器視窗中完成 Issue 與 Board 的主要操作，並透過鍵盤及可辨識的狀態訊息使用新版介面。

**Why this priority**: 內網工程團隊的工作環境不一定固定，UI 遷移不能只在單一寬度或滑鼠操作下可用。

**Independent Test**: 以鍵盤操作主要導覽、篩選、表單、Modal/Drawer 與 Board Card，並在窄視窗檢查內容不重疊、不被截斷且主要操作仍可完成。

**Acceptance Scenarios**:

1. **Given** 使用者只使用鍵盤，**When** 操作導覽、篩選、表單與主要按鈕，**Then** 焦點順序清楚，且每個互動控制項都有可理解的名稱或狀態。
2. **Given** 瀏覽器視窗寬度縮小，**When** 使用者查看 Issue detail 或 Board，**Then** 內容以可讀方式重新排列，主要資訊與操作不會被遮蔽。

### Edge Cases

- Issue Title、Repository 名稱、Label、Milestone 或 Comment 內容很長時，文字不應破壞清單列、Card、表單或詳細頁面版面。
- Issue 沒有 Assignee、Milestone、Labels、Description 或 Comments 時，顯示明確的空值狀態，不保留破版或無意義的空容器。
- Issue 清單、Issue detail、Board、Workflow Convention 或 Repository 載入失敗時，各頁面都要提供可理解的錯誤訊息與可重新嘗試的入口。
- 使用者沒有 Gitea 權限時，UI 不得透過新版元件暴露原本無法查看或修改的資料與操作。
- Board Card 的 Workflow Label 缺失、重複、修復成功或修復失敗時，既有預設狀態與 repair annotation 行為必須維持。
- Chart.js 尚未有對應產品頁面時，不得為了使用套件而新增未定義的 Dashboard 或統計需求。
- 移除舊樣式後，任何仍依賴舊 class 或舊元件的頁面都必須被遷移或明確保留其必要的行為責任，不得留下部分遷移造成的視覺混用。

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Portal MUST 導入並使用 Tailwind CSS 作為新版介面的樣式基礎。
- **FR-002**: Portal MUST 導入並使用 shadcn/ui 建立可重用的新版 UI 元件；核心元件包含導覽、按鈕、表單控制項、Card、Dialog/Drawer、Badge/Label、Table/List、Loading、Empty 與 Error 狀態。
- **FR-003**: Portal MUST 導入 Chart.js 作為核准的前端視覺化套件基礎；本功能不要求新增 Dashboard 或圖表頁面。
- **FR-004**: Portal MUST 導入 Storybook，並提供核心共用元件的獨立展示與狀態案例。
- **FR-005**: Issues 清單、Issue 篩選、分頁與空白/載入/錯誤狀態 MUST 全部改用新版 UI 呈現；既有搜尋、篩選、分頁與 Issue 開啟行為可在初始遷移暫時不完整，後續以新 framework 補齊。
- **FR-006**: Issue 建立、Issue detail、Issue 編輯、Close/Reopen、Comment 顯示與 Comment 建立 MUST 全部改用新版 UI 呈現；保留的操作仍 MUST 反映到 Gitea，未完成的操作可列為後續 framework-native redesign。
- **FR-007**: Board 清單、Board 建立/編輯、Repository 選擇、Workflow Convention 選擇與 Kanban Board MUST 全部改用新版 UI 呈現；初始遷移不要求所有操作 parity。
- **FR-008**: Kanban Card MUST 維持 Repository、Issue number、Title、Assignee、一般 Labels、狀態欄位與 Workflow repair/error 資訊的既有辨識能力；Board Card 不得恢復顯示該 Board Convention 的 Workflow Label。
- **FR-009**: Kanban 的拖曳與狀態轉換可在初始遷移暫時不完整；任何重新實作的狀態變更 MUST 保存為 Gitea 支援的 Workflow Label，不得只保存於前端呈現層。
- **FR-010**: 新版 UI MUST 為所有既有主要頁面提供一致的 Loading、Empty、Error、Permission denied、Saving 與 Success feedback 狀態。
- **FR-011**: 遷移後的主要頁面 MUST 不再使用已被取代的舊呈現方式；無資料或行為責任的舊樣式、舊元件與未使用資源 MUST 移除。
- **FR-012**: UI 遷移 MUST 保留現有 Gitea 權限邊界，Portal 不得因導入新元件而顯示或執行使用者原本無權限的 Issue 操作。
- **FR-013**: UI 遷移 MUST 不改變 Gitea Issue、Comment、Label、Assignee、Milestone、狀態或原始 Gitea URL 的資料語意與 Source of Truth 定義。
- **FR-014**: UI 遷移 MUST 不改變 Board JSON persistence 的 schema validation、資料格式版本、atomic write、flush 或並行寫入保護行為。
- **FR-015**: UI 遷移 MUST 不新增獨立 Issue database、Issue mirror、前端 Issue cache persistence 或其他 Gitea 以外的 Issue Source of Truth。
- **FR-016**: 新增套件與產生的元件程式碼 MUST 保留其授權要求，並讓專案可以辨識直接與間接依賴的第三方授權資訊。
- **FR-017**: 新版介面 MUST 支援鍵盤操作、可辨識的焦點狀態、語意化控制項名稱與載入/錯誤狀態公告，並在窄視窗下維持主要資訊與操作可用。
- **FR-018**: 遷移完成後，所有既有主要使用情境 SHOULD 優先使用新版 UI 的新元件結構；初始遷移允許功能落差，落差不得透過保留舊 UI 來掩蓋，應列為後續 framework-native work。
- **FR-019**: 新版 UI MAY 重新設計既有頁面的視覺、版面與互動呈現，但 MUST 保留既有功能、資訊語意、路由、Gitea 操作結果與 Board 行為。

### Key Entities

- **UI Component**: 可重用的新版介面元件，包含視覺、互動、狀態與可及性呈現規則。
- **Portal Page**: Issues、Issue Create、Issue Detail、Boards、Board Editor 與 Kanban 等既有使用者頁面。
- **Issue View State**: Issue 清單、篩選、載入、空資料、錯誤、編輯、Comment 與權限狀態的前端呈現狀態；不代表獨立 Issue 資料。
- **Board View State**: Board 欄位、Card、Workflow 狀態、拖曳轉換、修復結果與錯誤資訊的前端呈現狀態；不代表獨立 Board Issue 資料。
- **Component Showcase**: 開發者用來獨立查看與驗證共用 UI 元件及其狀態的展示內容。
- **Third-party License Record**: 直接與間接前端套件的授權與著作權資訊，供專案發佈與維護時查閱。

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Issues、Issue Create、Issue Detail、Boards、Board Editor 與 Kanban 六類主要畫面 100% 使用新版 UI 呈現，使用者不需要切回舊畫面完成既有操作。
- **SC-002**: Issue 與 Board 主要畫面 100% 使用新版 UI 元件與設計 token；功能 parity 與操作結果一致性可在後續 framework-native work 補齊，不作為本輪 UI stack migration 的阻擋條件。
- **SC-003**: 主要頁面中的 Loading、Empty、Error、Permission denied、Saving 與 Success 狀態 100% 使用一致的新版狀態呈現，沒有空白畫面或未處理錯誤狀態。
- **SC-004**: Kanban Card 100% 保留 Repository、Issue number、Title、Assignee、一般 Labels 與必要 Workflow repair/error 資訊；該 Board Convention 的 Workflow Label 100% 不在 Card Label 區域重複顯示。
- **SC-005**: 核心共用 UI 元件 100% 至少具備一個可獨立展示案例，並涵蓋正常、停用、載入、空資料或錯誤等適用狀態。
- **SC-006**: 使用鍵盤完成主要導覽、Issue 篩選、Issue 建立/編輯與 Comment 操作時，所有必要控制項皆可取得焦點、可辨識並可操作。
- **SC-007**: 在窄視窗檢查六類主要畫面時，0 個主要資訊區塊或必要操作被截斷、重疊或永久遮蔽。
- **SC-008**: UI 遷移前後，Gitea 權限限制、Issue Source of Truth、Board JSON persistence 與 Workflow Label 保存規則均維持不變，沒有新增獨立 Issue persistence。
- **SC-009**: 專案可以列出本次新增的直接與間接前端依賴授權資訊，且不會因缺少授權文件而阻擋練習專案的建置與內網部署流程。

## Assumptions

- 現有前端維持 React、Vite 與 pnpm workspace；本規格不重新選擇應用程式框架。
- 套件版本與相容性細節留給後續規劃階段依目前 React、Vite、TypeScript 與 pnpm 版本決定。
- Tailwind CSS、shadcn/ui、Chart.js 與 Storybook 是本功能指定的目標套件，不再以 Ant Design、MUI 或其他完整 UI library 作為替代方案。
- Storybook 主要供開發者隔離展示與維護元件，不會成為內網使用者的 Portal 功能入口。
- Chart.js 先完成安裝與整合準備；本功能不因導入 Chart.js 而增加 Dashboard、統計頁或新的業務需求。
- 舊 CSS、舊 class、舊元件與其不再需要的相依程式碼應盡量移除；不必等待所有既有功能 parity 完成，但不得刪除 Gitea API、權限、Source of Truth 或 Board persistence 責任。
- 本次 UI 遷移允許重新設計頁面版面與互動呈現，但不改變既有功能、資訊語意、路由與資料行為。
- Gitea 仍是 Issue、Comment、Label、Assignee、Milestone 與狀態的唯一 Source of Truth。
- Board 設定仍使用既有 JSON persistence，且不引入 PostgreSQL 或其他資料庫。
- 使用者已具備使用 Portal 與對應 Gitea Repository 的必要權限；本功能不重新定義 Authentication 或 Authorization。
- 專案的文件與使用者可見文字維持繁體中文，技術套件名稱與程式識別字保留英文。
