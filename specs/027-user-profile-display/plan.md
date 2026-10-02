# Implementation Plan: Gitea 使用者大頭貼與姓名顯示

**Branch**: `main` | **Date**: 2026-10-02 | **Spec**: [spec.md](spec.md)

**Input**: `specs/027-user-profile-display/spec.md`

## Summary

沿用 Gitea 使用者回應補上姓名與頭貼；保留所有 login 身份欄位，新增選填外觀資料。共用人員元件服務帳戶、Issue 各視圖、留言與設定頁，人員選單及篩選摘要採姓名優先。Session 每次載入重新讀取登入者，暫時故障降級，401 沿用既有重新登入流程。

## Technical Context

**Language/Version**: TypeScript 5.8、Node.js 22；React 19。
**Primary Dependencies**: pnpm 9 workspace、Fastify 5、Vite 6、i18next、Storybook 8。
**Storage**: 無新增資料库；外觀快取只置於既有簽章 HttpOnly session，保留原 expiresAt 與 csrfToken。
**Testing**: typecheck、build、Storybook build；以本機模擬 Gitea 與 Fastify inject 驗證讀取契約及失敗分類，瀏覽器檢視各視圖。無新增測試框架。
**Target Platform**: 內網桌面瀏覽器與 Windows 開發環境。
**Project Type**: 四套件 pnpm workspace Web 應用。
**Performance Goals**: Issue、留言及指派人資料沿用原查詢，不逐人追加請求；每次 session 查詢最多增加一個 /user 讀取，沿用設定 timeout。
**Constraints**: 無 Gitea mutation、無 credentials 前端或日誌輸出；原人員順序、login 排序、篩選及權限不變。
**Scale/Scope**: 沿用目前所有可讀 Repository／Issue 規模；1440、720、375 CSS 像素、三語系與明暗主題。

## Constitution Check

設計前與設計後均 PASS：

| 原則 | 實作約束 |
| --- | --- |
| I 唯一資料來源 | 讀 Gitea，不新增使用者／Issue persistence |
| II 目前使用者權限 | session 刷新直接使用 cookie 中的 delegated token；禁止 Authorization header 替換登入者 |
| III 安全寫入 | 不修改 Issue、Labels 或 status mutation 路徑 |
| IV 完整彙整 | 外觀更新降級只限 session；Issue／留言必要查詢仍沿用錯誤處理 |
| V 固定狀態 | 保留 currentOwner、最後負責人、狀態及 anomaly 語意 |
| VI 工作範圍可辨 | 保留 Repository、Issue key 與原導覽 |
| VII 多語系 | 共用人員提示使用 common 三語系 key；姓名／login 不翻譯 |

## Project Structure

### Documentation (this feature)

`specs/027-user-profile-display/` 包含 spec、plan、research、data-model、contracts/user-profiles.md、quickstart 與後續 tasks。

### Source Code (repository root)

- `packages/domain/src/user-profile.ts`：UserProfile、UserProfiles 及顯示／合併 helpers；issue.ts、index.ts 同步擴充。
- `packages/gitea-contracts/src/`：GiteaUser 與 Session 的相容欄位。
- `apps/api/src/`：Gitea normalizer、mapIssue、assignee endpoint、OAuth、session 及 session route。
- `apps/web/src/`：UserIdentity、bootstrap/App、設定、Issue 人員呈現、WorkViewFilterBar／Layout、Storybook 與樣式。

**Structure Decision**: 保持原四套件結構，不增加服務、資料庫或相依套件。

## Phase 0: Research

見 [research.md](research.md)。已確認名稱遺失位置、session error mapping、Gantt DOM 欄寬量測及共用篩選摘要；無未解決技術或產品決策。

## Phase 1: Design

見 [data-model.md](data-model.md) 與 [contracts/user-profiles.md](contracts/user-profiles.md)。

- UserProfile 的 fullName、avatarUrl 均選填；顯示姓名 trim 後 fallback login。頭貼接受 HTTP／HTTPS 網址，其他值使用預設人像。
- IssueSummary 新增 userProfiles，收錄 author／assignee／assignees，不改帳號欄位；字典讀取須驗證 own property，避免特殊帳號與 prototype 衝突。
- Session 回應維持 login，新增 displayName、avatarUrl；成功更新可移除舊姓名／頭貼，不以舊值補上來源已清除的欄位。更新保留原 session 期限與 CSRF。
- 401 交既有 error handler；其他外觀更新錯誤只記錄安全狀態摘要，回傳原快取或帳號。身份與 cookie login 不符時拒絕並要求重新登入。
- UserIdentity 的圖片固定 24px／32px、alt 空字串，姓名可換行；可聚焦的帳號提示同時提供完整姓名、帳號及 aria description。嵌入既有按鈕時避免額外 focus target。
- filter 維持 string[] login 介面並增加選填 userProfiles；所有載入路徑及 WorkViewLayout 摘要均傳入合併後資料。選單保留 native select，顯示姓名（帳號）。
- Gantt 既有 clone DOM intrinsic width 量測能包含固定寬頭貼；確保人員 tooltip 不参与欄寬，長名可讀。
- Storybook 提供一個跨元件驗收頁，含 account、Issue table、Kanban、Gantt、詳情及留言，使用虛構資料，提供三語系、主題與寬度操作。

## Validation

依 [quickstart.md](quickstart.md) 執行契約、型別、建置與瀏覽器驗收。真實 Gitea 的頭貼更換驗收如無可操作登入狀態，須保留未驗證紀錄，不以 mock 代替真實驗收。只讀取／顯示的回歸不呼叫真實 Gitea mutation。
