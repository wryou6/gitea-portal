# Research: 固定 Issue 工作流

## Decision 1: 固定狀態與原因規則放在共享 Domain package

**Decision**: 由 `packages/domain` 提供不可按 Repository 或 Board 修改的狀態與轉換原因定義；API 與 Web 共用相同 key、目標狀態、Label name 及繁體中文顯示文字。

**Rationale**: 現有 workflow 透過 `WorkflowConvention`、YAML repository assignment、API route 和 Board versioning 分散定義。將新規則集中於 domain 可避免各層各自推導 24 個轉換理由。

**Alternatives considered**: 以 JSON/YAML 動態載入固定狀態；拒絕，這仍保留多 Convention 設定與執行期設定錯誤。

## Decision 2: Todo/In Progress 是 Labels，Done 是 Gitea Closed

**Decision**: 固定狀態 Labels 為 `workflow:todo`、`workflow:in-progress`；Done 不建立狀態 Label，只將 Issue 關閉。最後轉換原因以一個 `workflow-action:<stable-key>` Label 表示。

**Rationale**: 符合 spec 已決定的 Gitea state mapping 及「只保留最後原因」規則。保留既有 `replaceIssueLabelsAtomically` 路徑，寫入前比對 Issue `updatedAt` 及 Labels，寫入後讀回確認。

**Alternatives considered**: 將 Done 也存為 Label；拒絕，會讓 Closed 與狀態 Label 產生雙重來源。

## Decision 3: Gitea Assignees 有序名單由清空後完整寫回維持

**Decision**: Issue DTO 擴充完整 `assignees[]`。需要變更順序時先寫入空清單，再以目標順序完整寫入；成功後讀回比對。寫入失敗時用原清單補償，補償失敗要回報實際讀回狀態。

**Rationale**: 對本機 Gitea `admin/portal-test-api#5` 的實測：

1. 寫入 `[admin, admin2, admin3]` 後，三次並行讀取都回相同順序。
2. 對同一 Assignee 集合直接寫入不同順序 `[admin3, admin, admin2]`，Gitea 仍回傳原順序。
3. 清空後寫入 `[admin3, admin, admin2]`，三次讀取及第二次清空／寫入循環仍保留指定順序。
4. 測試後將 Issue Assignees 還原為原本的 `[admin]`；Issue State、Labels、Body 和 comment count 均未改動。

相同清空／完整寫回行為必須透過 API 的實際 Gitea 版本驗收。清空與寫入是兩個 API 請求，中間存在短暫無 Assignee 的窗口，所以操作需保留原清單以補償，且不得將中途結果呈現為成功。

**Alternatives considered**: 只 PATCH 一個新順序；拒絕，實測不會重排。用 Portal persistence 保存順序；拒絕，違反 Gitea 是 Assignee source of truth 的產品邊界。以 owner Label 取代第一位語意；不採用，因清空後完整寫回在本機 Gitea 已可維持順序。

**Primary sources**: Gitea [Edit an issue API](https://docs.gitea.com/api/operations/issue-edit-issue/) 支援 `assignees` 欄位；Gitea [Issue API schema](https://docs.gitea.com/api/operations/issue-get-issue/) 回傳 assignees array。官方文件未承諾同一集合的任意重排行為，因此以上順序依賴本機實測並需納入 quickstart acceptance。

## Decision 4: 更新 Issue 時使用 compensating workflow，而不是跨端假裝原子

**Decision**: 狀態 Label 與原因 Label 作單一 atomic replacement。Issue Open/Closed 與 Assignees 是其他 Gitea API 操作，transition service 先讀取原始 snapshot，按既定順序執行，失敗時回復已成功的部分並讀回結果；只有所有步驟和最後讀回均成功才回應成功。

**Rationale**: Gitea API 沒有跨 Issue state、Labels、Assignees 的單一交易 endpoint。App 不能宣稱跨 endpoint 原子性；補償和最後讀回能讓失敗清楚可辨識。

**Alternatives considered**: label remove/add 分開操作；拒絕，違反目前 atomic replacement contract。對 Portal 顯示成功但不讀回；拒絕，無法辨識 Gitea 未保存的變更。

## Decision 5: 以版本升級移除 Board Convention 欄位

**Decision**: Board JSON schema 遞增 format version，舊記錄載入時移除 `workflowConventionId`／`workflowConventionVersion`，再經現有驗證與 atomic save 寫成新格式。Board repository 範圍、名稱及時間欄位保留。

**Rationale**: Board 的 Convention reference 只用於狀態相容性；固定 workflow 不需要該欄位。保留既有 Board 和 JSON store 的鎖定／原子寫入邊界。

**Alternatives considered**: 保留無效欄位以相容舊格式；拒絕，前端和 API 仍會誤以為 Convention 是有效產品概念。

## Decision 6: Dummy Gitea fixture 在實作期間直接正規化

**Decision**: 不實作產品遷移 UI、對照表或遷移資料。實作時對目前測試 Repository 的 dummy Issues 分布套用 Todo／In Progress／Done，按狀態同步 Open／Closed，再移除舊 Convention/status/reason Labels 和 `config/workflows/conventions.yaml`。

**Rationale**: 使用者已確認現有 Issues 是 dummy data，可直接改為新狀態；移除舊狀態時不需保留業務歷史。

**Alternatives considered**: 建立 Portal migration wizard 或持久化 mapping report；拒絕，超出 dummy data 重設需求。

## Decision 7: 使用 API contract 與手動端到端 quickstart，不引入測試套件

**Decision**: 以 Markdown 合約記錄 API shape 和 error behavior；quickstart 記錄人工驗收步驟及 repository 現有 typecheck/build commands。此功能不新增自動化測試套件。

**Rationale**: repository package.json 沒有測試 runner 或既有測試檔；task skill 要求只有明確指定才建立測試任務。

**Alternatives considered**: 引入 Vitest/Playwright 並建立測試框架；拒絕，超出本次明確要求。

## Decision 8: Issue 列表、Kanban、Gantt 共用一致的工作台設計

**Decision**: 重新設計 Issue 列表、Kanban、Gantt 三個既有畫面，並為每個畫面提供 Storybook story。沿用目前 Tailwind 4 與既有語意 tokens，不加入新的 UI runtime；設計採 Minimalism & Swiss 的網格、清楚層級與標準資料密度，沿用深藍/藍/綠的專業工具色彩及 Inter 字體。

**Rationale**: UI/UX Pro Max 的內部工具與 productivity 搜尋建議 Minimalism & Swiss、專業藍/功能狀態色及一致的工作台層級；UX 指引要求拖曳以外也有鍵盤／按鈕操作、可見焦點、互動 hover 狀態與響應式版面。Portal 已使用 Tailwind 與 Storybook，沿用目前技術能讓三個畫面保持一體，不增加套件。

**Alternatives considered**: 將 Issue detail 也納入重新設計；不採用，使用者指定的三個畫面是 Issue 列表、Kanban、Gantt。
