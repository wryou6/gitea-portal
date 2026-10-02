# Tasks: Gitea 使用者大頭貼與姓名顯示

**Input**: `specs/027-user-profile-display/` 的 spec、plan、research、data-model 與 contracts。
**Organization**: 依使用者情境交付；`[P]` 僅代表不同檔案可獨立處理，本次依序執行。

## Phase 1: Setup

- [X] T001 驗證根目錄 package.json 與 .gitignore，恢復 frozen-lockfile 依賴及必要 formatter ignore，保留現有工作變更（plan: workspace）。

## Phase 2: Foundational

- [X] T002 在 packages/domain/src/user-profile.ts、issue.ts、index.ts 與 packages/gitea-contracts/src/gitea.ts、portal.ts 新增外觀型別及 helpers；「fullName：選填 string，trim 後空白視為未設定」「avatarUrl：選填 string；只顯示有效 HTTP／HTTPS 圖片網址」；userProfiles 選填，字典只讀 own property，身份仍為 login（FR-001、FR-002、FR-006、FR-017）。
- [X] T003 在 apps/api/src/gitea/client.ts 統一 user、comment、assignees、currentUser 正規化姓名及頭貼，不增加逐人請求（FR-001、FR-009、FR-011、FR-012）。
- [X] T004 在 apps/web/src/components/ui/UserIdentity.tsx 與 apps/web/src/lib/user-profiles.ts 建立共用呈現、合併與選項 helpers，支援舊資料、固定圖片尺寸、破圖降級及鍵盤帳號提示（FR-002、FR-003、FR-005、FR-015、FR-017）。
- [X] T005 在 apps/web/src/index.css 與 apps/web/src/i18n/resources/common.ts 加入人員樣式及三語系提示，保持明暗主題、窄視窗、相鄰內容與 Gantt 量測可讀（FR-014、FR-015、FR-016）。

## Phase 3: User Story 1 - 登入帳戶（P1／MVP）

**Independent Test**: 帳戶呈現有名／無名／缺圖情境，選單、設定與登出可操作。

- [X] T006 [US1] 在 apps/api/src/auth/session.ts、oauth.ts 與 http/routes.ts 保存／回傳選填外觀，公共回應不含 credentials；維持 session 期限與 CSRF（FR-001、FR-011、FR-017）。
- [X] T007 [US1] 在 apps/web/src/main.tsx、features/auth/session-state.ts、app/App.tsx 與 components/layout/AppShell.tsx 傳遞登入者外觀並更新帳戶呈現與可及名稱（FR-002、FR-003、FR-005、FR-013、FR-015、FR-017）。
- [X] T008 [US1] 在 apps/web/src/features/settings/SettingsPage.tsx 與 components/layout/Layout.stories.tsx 套用姓名優先與帳號提示，不改 login 個人偏好 key（FR-005、FR-006、FR-013）。

## Phase 4: User Story 2 - Issue 人員（P1）

**Independent Test**: 同一 Issue 的建立者、負責人與留言者在所有既有人員位置身份一致，未指派與完成狀態保留原意。

- [X] T009 [US2] 在 apps/api/src/issues/issue-service.ts 與 apps/web/src/lib/api.ts 增加選填 userProfiles，包含 author、assignee、assignees；在 features/issues/types.ts 擴充 Comment.user（FR-004、FR-006、FR-008、FR-017）。
- [X] T010 [US2] 在 apps/web/src/features/issues/IssueRow.tsx、features/work-views/KanbanCard.tsx、GanttIssueRow.tsx 套用共用人員，保持原人員選取、狀態與列對齊（FR-004、FR-008、FR-013、FR-014）。
- [X] T011 [US2] 在 apps/web/src/features/issues/IssueDetailHeader.tsx、IssueAssigneeRoster.tsx、IssueComments.tsx 顯示建立者及各人員外觀，不變更指派順序、留言內容或空狀態（FR-004、FR-008、FR-013、FR-015）。
- [X] T012 [US2] 在 apps/web/src/stories/fixtures.ts 與 components/ui/UserIdentity.stories.tsx 建立含各視圖的虛構外觀验收資料與缺圖、長名、同名情境（SC-001、SC-002、SC-006）。

## Phase 5: User Story 3 - 正確選取人員（P1）

**Independent Test**: 同名不同帳號的篩選與指派選項可區分，值與結果維持 login。

- [X] T013 [US3] 在 apps/web/src/features/work-views/WorkViewFilterBar.tsx、work-view-filter-labels.ts、WorkViewLayout.tsx 增加選填 userProfiles；於 features/issues/IssueListPage.tsx、work-views/KanbanBoard.tsx、GanttBoard.tsx 傳遞合併資料，涵蓋選項、chip 及 summary（FR-005、FR-006、FR-007）。
- [X] T014 [US3] 在 apps/api/src/repositories/repository-routes.ts 與 apps/web/src/features/issues/StatusTransitionDialog.tsx 保留外觀欄位並使用姓名（帳號）選項，value 仍為 login（FR-005、FR-006、FR-011）。
- [X] T015 [US3] 在 apps/web/src/components/ui/UserIdentity.stories.tsx 加入同名選項及篩選互動驗收，不呼叫真實 mutation（SC-003、SC-007）。

## Phase 6: User Story 4 - 更新外觀（P2）

**Independent Test**: 重新載入後更新或清空外觀，暫時失敗 fallback，401 沿用重新登入流程。

- [X] T016 [US4] 在 apps/api/src/http/routes.ts 用 cookie session 自己的 token 刷新 currentUser，成功完整替換／清空外觀且保留 expiresAt/csrfToken；401 重拋既有 handler，其餘只降級外觀；login 不符時拒絕（FR-009、FR-010、FR-011、FR-017、SC-004、SC-005）。

## Phase 7: Polish & Validation

- [X] T017 在 apps/api/scripts/validate-user-profiles.ts 建立可執行的本機 mock 驗證腳本，核對契約、GET-only、login 身份、快取替換、失敗分類及秘密不外洩；於 specs/027-user-profile-display/quickstart.md 記錄執行指令（FR-001–FR-012、FR-017、SC-001–SC-005、SC-007）。
- [X] T018 執行 apps/web/src/components/ui/UserIdentity.stories.tsx 的三語系、明暗與 1440／720／375 瀏覽器驗收，核對頭貼、提示、長名、選單、Gantt 對齊；將證據寫入 specs/027-user-profile-display/quickstart.md（FR-013–FR-016、SC-006、SC-007）。
- [X] T019 對 package.json 的 typecheck/build 及 apps/web/package.json 的 build-storybook 執行檢查，檢查本次變更格式與空白並將結果寫入 specs/027-user-profile-display/quickstart.md（Constitution: development gates）。
- [X] T020 在 README.md 簡述使用者外觀行為，更新 specs/027-user-profile-display/quickstart.md 的真實 Gitea 驗收證據；未有授權測試帳戶與頭貼變更條件時明確保留未驗證項目（SC-004、plan: evidence boundary）。

## Dependencies & Execution Order

T001 → T002–T005 → US1 → US2 → US3 → US4 → T017–T020。共享檔案依序編輯，US2／US3／US4 依 foundational 可獨立驗收；本次全部情境完成後才做 converge。

## Parallel Opportunities

基礎完成後，US1 的設定頁、US2 的獨立呈現元件與 US3 的選項呈現可在不同檔案處理；所有 api.ts、App.tsx、UserIdentity stories、CSS 或 tasks.md 編輯維持順序，不將尚有依賴的任務標為 [P]。

## Implementation Strategy

MVP 為 US1 帳戶顯示。接著逐情境整合，使用 mock 驗證避免修改真實 Gitea；最後完成畫面與建置證據。所有 task 必須有實際完成證據才勾選，外部驗收條件缺失留待後續，不用 build 取代畫面驗收。
