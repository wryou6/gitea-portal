# 需求品質檢查清單：Gitea 跨 Repository Issue Portal

**目的**：檢查 Portal 需求在 Gitea 整合、授權、Board 行為與 Workflow Convention 規則上的完整性、清晰度、一致性與可衡量性。
**建立日期**：2026-09-20
**Feature**：[spec.md](../spec.md)

**說明**：本自訂清單由 `$speckit-checklist` 根據 feature context 與需求產生。
**審查責任**：本清單是由 reviewer 負責的需求品質審查文件。只有 reviewer 判定需求品質條件已滿足時，才可將項目標記為 `[x]`。
**標記語意**：`[x]` 代表該需求品質條件已完成審查並符合，不代表實作工作已完成。

## 需求完整性

- [x] CHK001 - 是否明確列出所有使用者可執行的 Issue 操作，包括建立、編輯、關閉、重新開啟、留言與前往原始 Gitea 頁面？[完整性，Spec §User Stories 2-4]
- [x] CHK002 - 規格是否定義完整的 Board 持久化設定邊界，且沒有暗示 Issue 資料會儲存在 Portal？[完整性，Spec §FR-011b、§FR-018、Data Model §Persistence boundary]
- [x] CHK003 - 是否將 Workflow Convention 的識別、版本、有順序的狀態、Label 名稱與 Repository 指派列為必要設定概念？[完整性，Spec §FR-015a、§FR-015e-§FR-015h、Data Model §WorkflowConvention]
- [x] CHK004 - 是否同時定義共享 Board 設定，以及 Board 內每位使用者各自的 Gitea Issue 可見性？[完整性，Spec §FR-011、§FR-011a、§FR-016a]
- [x] CHK005 - 是否列出清單、詳情、Card 與修改流程所需的所有 Gitea 外部資料欄位？[完整性，Spec §FR-002、§FR-006、§FR-012、Data Model §GiteaIssue]

## 需求清晰度

- [x] CHK006 - 「相同 Workflow Convention」是否精確到必須是相同的 immutable Convention version，而不只是相同顯示名稱？[清晰度，Spec §FR-015、§FR-015h]
- [x] CHK007 - 「未設定狀態」與「狀態衝突」是否定義為兩種不同的 Issue 顯示狀態，且各自有清楚原因？[清晰度，Spec §FR-015b、User Story 6]
- [x] CHK008 - 當不同 Repository 有相同 Issue Number 時，Repository identity 是否仍然明確？[清晰度，Spec §FR-021、Data Model §BoardRepository]
- [x] CHK009 - 「所有可存取 Repository」是否明確受目前使用者的 Gitea 授權限制，而不是由 Portal 設定決定？[清晰度，Spec §FR-001、§FR-016-§FR-017]
- [x] CHK010 - 失敗訊息是否能區分授權拒絕、資料不存在、外部服務不可用、衝突，以及 atomic Label transition 被拒絕或失敗？[清晰度，Spec §FR-020、§FR-020a、Edge Cases]

## 需求一致性

- [x] CHK011 - Gitea Source of Truth 要求與 Board 設定持久化邊界是否一致，且 Portal 設定不能覆寫 Issue 資料？[一致性，Spec §FR-018、§FR-022、Data Model §Validation invariants]
- [x] CHK012 - User Stories、Functional Requirements 與 PermissionContext 是否一致區分共享 Board 可見性及每位使用者的 Issue 授權？[一致性，Spec §FR-011、§FR-016a、Data Model §PermissionContext]
- [x] CHK013 - 「不建立 owner/member 資料」與所有 Portal 使用者可修改/刪除共享 Board 的規則，是否沒有引入隱含 Board role？[一致性，Spec §FR-011a、Data Model §Board]
- [x] CHK014 - Convention version immutable、既有 Board 固定版本、新 Board 選擇新版等規則，在 assumptions 與 data model 間是否一致？[一致性，Spec §FR-015h、Assumptions、Data Model §WorkflowConvention]
- [x] CHK015 - 非 Workflow Labels 是否一致地排除在 Convention 相容性之外，同時仍可正常篩選與顯示？[一致性，Spec §FR-015c-§FR-015d、User Story 6]

## 驗收條件品質

- [x] CHK016 - 成功標準是否能客觀區分 Portal 顯示的資料，以及已在 Gitea 確認的資料？[可衡量性，Spec §SC-003-§SC-004]
- [x] CHK017 - 90%、95%、100%、時間與 Repository 數量目標，是否連結到可辨識的使用者流程，而不只是實作指標？[可衡量性，Spec §SC-001-§SC-008]
- [x] CHK018 - 規格是否定義「成功的 Issue 操作」不包含被拒絕、atomic transition 失敗或外部服務不可用的操作？[清晰度，Spec §SC-004、§FR-020a]
- [x] CHK019 - 成功標準是否足以衡量 Portal 不可用時，必要的 Issue 資訊仍然存在？[驗收條件，Spec §SC-007]

## 情境覆蓋

- [x] CHK020 - 跨 Repository 瀏覽、搜尋、篩選、詳情與前往 Gitea 的主要流程，是否都能獨立驗證？[覆蓋率，Spec §User Story 1-2]
- [x] CHK021 - 是否涵蓋查看、建立、編輯、留言、關閉、重新開啟、Board 編輯與 Card transition 等不同權限層級？[覆蓋率，Spec §FR-008-§FR-017]
- [x] CHK022 - Issue 直接在 Gitea 修改後，再回到 Portal 查看時，是否定義恢復與重新讀取要求？[恢復流程，Spec §FR-019、User Story 5 Scenario 4]
- [x] CHK023 - 相容 Convention、不相容 Convention、未設定狀態與狀態衝突等情境，是否全部出現在驗收條件中？[覆蓋率，Spec §User Story 6、§FR-015-§FR-015b]
- [x] CHK024 - 共享 Board 的建立、編輯、刪除、持久化與不刪除 Gitea Issue 等語意，是否全部有對應情境？[覆蓋率，Spec §FR-011-§FR-011b、Data Model §Board]

## 邊界情況覆蓋

- [x] CHK025 - 是否定義 Gitea 並行編輯與不可靜默覆蓋的衝突行為，且沒有承諾不支援的 rollback？[例外流程，Spec §Edge Cases、§FR-020]
- [x] CHK026 - 當 atomic Label replacement 無法保證時，是否定義在任何 Gitea 修改前拒絕操作？[恢復流程，Spec §FR-020a、Data Model §State transitions]
- [x] CHK027 - 是否涵蓋 Repository、Issue、Label、Milestone 被刪除、封存、失去存取權或內容變更的情況？[邊界情況，Spec §Edge Cases]
- [x] CHK028 - 是否明確定義空的 Label、Assignee、Milestone、Comment 與搜尋結果狀態？[完整性，Spec §Edge Cases]
- [x] CHK029 - 不同 Repository 的相同 Issue Number 是否在所有相關流程中都能避免 identity collision？[邊界情況，Spec §FR-021、Data Model §BoardRepository]

## 非功能需求

- [x] CHK030 - 是否對所有受保護資源與修改操作明確要求授權，包括 Board read-through 的 Issue 資料？[安全性，Spec §FR-016-§FR-017]
- [x] CHK031 - Plan 是否明確指出 browser client 永遠不會取得共用或提升權限的 Gitea credential？[安全性，Plan §Technical Context、Research §Decision 2]
- [x] CHK032 - 效能目標是否從使用者角度表達，並連結到指定的主要流程？[效能，Spec §SC-001-§SC-005、Plan §Technical Context]
- [x] CHK033 - Gitea 不可用時的可用性與降級行為是否明確，包括禁止顯示錯誤成功？[可靠性，Spec §FR-020、Edge Cases]
- [x] CHK034 - 無障礙、在地化與 responsive 使用需求，是否被明確指定或明確排除？[缺口，Spec §User Stories、Assumptions]

## 依賴與假設

- [x] CHK035 - 是否列出所需的 Gitea API capability、支援的 instance version、OAuth2 provider 設定與 permission scope？[依賴，Plan §Technical Context、Research §Decision 1-2]
- [x] CHK036 - 集中且唯讀的 Workflow Convention 設定，與可修改的 Board 設定之間的差異是否明確？[假設，Spec §FR-015e-§FR-015f、Plan §Structure Decision]
- [x] CHK037 - 第一版範圍是否足夠清楚，能避免 PR、Code Review、CI/CD、Custom Fields 與 Project Management scope 膨脹？[範圍，Spec §Non-target、Assumptions]
- [x] CHK038 - Quickstart prerequisites 是否足以在不使用真實 production Issue 資料的前提下，重現成功與權限拒絕情境？[依賴，Quickstart §Prerequisites、§Acceptance evidence]

## 模糊處與衝突

- [x] CHK039 - Board movement 必須呈現為 atomic result 的要求，是否已與 Gitea 外部操作能力的不確定性協調？[模糊處，Spec §FR-020a、Plan §Constraints]
- [x] CHK040 - 「集中設定」是否定義單一權威來源與變更/版本生命週期，而不是允許多個設定權威？[模糊處，Spec §FR-015e-§FR-015h、Data Model §WorkflowConvention]
- [x] CHK041 - exact Label prefix/namespace 語法、Gitea version capability check、OAuth provider 設定與 deployment wiring 等延後決策，是否清楚排除於產品需求，但保留為實作規劃必要項目？[邊界，Spec §Assumptions、Plan §Gate status after design]

## 備註

- 只有 reviewer 確認需求品質條件已滿足後，才將項目標記為 `[x]`。
- 當規格或 plan 仍需釐清或修正時，維持未勾選。
- 本清單評估書面需求，不評估實作行為。
- `$speckit-implement` 會讀取 checklist 狀態作為 gate，但不會修改 reviewer marker。

## Implementation review notes

- 已完成跨 Repository read-through、Issue mutation、Comment、OAuth delegated session、共享 Board、Workflow Convention compatibility 與 atomic Label transition 的程式骨架與 TypeScript/build 驗證。
- T012 的目前 persistence adapter 為可替換的 in-process Database boundary；正式 PostgreSQL wiring 留待部署與資料庫規劃階段，未把 Issue 資料寫入 Portal。
- T069 的六個 quickstart 情境需要目標內網 Gitea、OAuth client 與測試帳號；本次沒有可用的外部測試環境，因此未宣稱端到端通過。
- `checklists/requirements.md` 是由 `$speckit-specify` 與 `$speckit-clarify` 維護的獨立內建規格清單。
