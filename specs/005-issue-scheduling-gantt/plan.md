# Implementation Plan: Issue 排程日期與甘特圖

**Branch**: `005-issue-scheduling-gantt` | **Date**: 2026-09-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/005-issue-scheduling-gantt/spec.md`

## Summary

讓 Gitea Issue 的 start date 與原生 due date 在 Issue 清單、詳情及既有 Board 甘特圖中可讀寫與檢視。日期仍以 Gitea 為唯一來源：due date 走 Issue API 欄位，start date 走 Gitea Issue Label；API/domain 回傳正規化的日期欄位，Board 專用唯讀端點逐 Repository 載入全部 Issue 分頁，Web 在 Kanban/Gantt 間切換並呈現日期區間、單日項目、異常及未排程清單。

## Technical Context

**Language/Version**: TypeScript 5.8, Node.js 22, React 19

**Primary Dependencies**: Fastify 5, React 19, Vite 6, pnpm 9 workspace；不新增執行期依賴

**Storage**: Gitea Issue 原生 `due_date` 與 Issue Labels；Board metadata 仍由既有 JSON store 保存，不新增 Issue/date persistence

**Testing**: Repository 未設定專用測試 runner；執行 `pnpm.cmd typecheck`、`pnpm.cmd build`，並依 quickstart 在 Gitea 測試手動驗收流程

**Target Platform**: 內網瀏覽器、Node.js 22 API、使用 delegated OAuth access token 的 Gitea

**Project Type**: pnpm monorepo web application (`apps/api`, `apps/web`, `packages/domain`, `packages/gitea-contracts`)

**Performance Goals**: 不丟棄符合條件的分頁結果；不設固定 Issue 上限。規格未指定載入時間 SLA，Gitea 呼叫延遲依 Repository 數量及部署環境而定。

**Constraints**: 遵守登入者 Gitea 權限；Label 修改須原子替換及 optimistic concurrency；日期採無時區日曆日期；Board 不得鏡像 Issue；甘特圖須有可鍵盤操作的非 Canvas 呈現及窄螢幕替代清單。

**Scale/Scope**: 一個 Board 設定的 Repository 集合、其使用者可讀取的全部 Issues；所有分頁都要載入。未提供 Repository/Issue 數量基線。

## Constitution Check

Project constitution `.specify/memory/constitution.md` 目前只有模板 placeholder，沒有已批准的原則可作為正式 gate。依 repository `AGENTS.md` 與 `README.md` 的現行治理規則檢查：

- **Gitea Source of Truth**: PASS — schedule data 只由 Gitea Issue/Label 讀寫，不建立 mirror。
- **Delegated authorization**: PASS — 使用 request-scoped GiteaClient；禁止 service token 代替使用者。
- **Board persistence boundary**: PASS — JSON store 只保存 Board 設定，不變更 Board schema 或保存 Issue 日期。
- **Workflow label safety**: PASS — start date Label 替換保留 Workflow/一般 Labels，使用既有 atomic replacement 與 concurrency check。
- **Workspace/API contract**: PASS — domain、Gitea contracts、API mapper/routes 與 Web types 同步修改。
- **UI validation**: PASS — 完成後至少執行 typecheck 與 build。

## Project Structure

### Documentation (this feature)

```text
specs/005-issue-scheduling-gantt/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── issue-schedule.md
│   └── board-gantt.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/api/src/gitea/client.ts
apps/api/src/gitea/label-replacement.ts
apps/api/src/issues/issue-command-service.ts
apps/api/src/issues/issue-routes.ts
apps/api/src/issues/issue-service.ts
apps/api/src/issues/issue-validation.ts
apps/api/src/boards/board-routes.ts
apps/api/src/boards/board-view-service.ts
apps/api/src/boards/gantt-service.ts
apps/web/src/features/issues/IssueCreatePage.tsx
apps/web/src/features/issues/IssueEditForm.tsx
apps/web/src/features/issues/IssueListPage.tsx
apps/web/src/features/issues/IssueDetailHeader.tsx
apps/web/src/features/boards/KanbanBoard.tsx
apps/web/src/features/boards/GanttBoard.tsx
apps/web/src/features/boards/types.ts
apps/web/src/lib/api.ts
apps/web/src/index.css
packages/domain/src/issue.ts
packages/domain/src/board.ts
packages/gitea-contracts/src/gitea.ts
packages/gitea-contracts/src/portal.ts
README.md
```

**Structure Decision**: 保留既有四個 workspace package。Issue schedule normalization/contract 放在共用 domain 與 Gitea contracts；Gitea I/O 和 Board 全分頁聚合放在 API service；Issue 表單與日期呈現延伸既有 issue feature；Gantt 與 view toggle 放在既有 Board feature。甘特圖用語意化 HTML/CSS 日期列，不用 Canvas：專案已有 Chart.js，但規格要求鍵盤及非 Canvas 替代清單，DOM 日期列可直接提供這些能力且不需新增 adapter。

## Architecture and Data Flow

1. API client 解析 Gitea Issue `due_date`，保留 RFC 3339 原值供 contract mapping，並正規化成 `YYYY-MM-DD` 日曆日期；start date parser 從專用 Label 讀取日期。
2. Issue create/update service 驗證日期並透過登入者 token 寫回 Gitea。Due date 使用 Issue create/PATCH 支援的原生欄位；start date 用 Gitea repo-scoped Label ID 更新 Issue Labels。
3. Start date Label mutation 以 `start-date:YYYY-MM-DD` 查找完整分頁中的 Repository Label definitions；必要時依登入者權限建立並重用定義，再呼叫 `replaceIssueLabelsAtomically`。替換必須重讀、核對原 Issue `updatedAt` 與完整 Label 集合、一次 PUT、再驗證 Gitea 保存結果；任何失敗回傳錯誤及最新 Gitea schedule，不回報未保存值為成功。日期 Label 由日期欄位管理，一般 Labels 編輯不能清除或複製日期 Label。
4. `GET /api/boards/:id/gantt` 驗證 Board 與既有 Repository read permission，為每個 Board Repository 循序取完 `state=all` 的所有 Issue 分頁，保留必要錯誤語意並回傳正規化日期及完整 Issue 身分。不要沿用目前 Board view 只讀單頁的行為。
5. Web 在 Board 共享載入狀態與頁首中加入 Kanban/Gantt toggle。Gantt 依目前使用者、可選 Assignee 與 Open/Closed filter 顯示 issues；完整日期繪製區間、單邊日期繪製 display-only 單日、兩邊缺日期列於圖下未排程區、無效日期列於異常區。
6. Gantt 的主視圖用可聚焦的 Issue link 與語意化列；小螢幕提供具日期文字的清單，甘特圖不依賴 Canvas 才能取得 Issue 或日期資訊。

### Schedule Mutation Semantics

Gitea due date 與 Issue Labels 是分開的 Gitea mutation，無跨欄位交易。若同一表單同時更新兩者而其中一步失敗，API 必須重新讀取 Gitea 的實際值並回傳可辨識的失敗；Web 顯示已保存/未保存欄位的實際狀態，不自行 rollback 成功的外部 mutation，也不把部分成功呈現為整體成功。實作細節須保持和 FR-013 一致。

### Confirmed Label Encoding and Lifecycle

使用者已確認格式 `start-date:YYYY-MM-DD`，Portal 依登入者權限建立或重用 Repository-scoped 定義，清除 Issue 日期時保留未使用的定義。每個不同日期可能形成一個 repo label definition；不可自動刪除這類共用 Labels。日期 Label 由專用日期欄位管理，一般 Labels 編輯須保留它。

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Repository date labels 需要建立/重用共用 Label definitions，可能隨日期累積 | 採精確格式與冪等查找/建立；依確認事項保留未使用 Label，不做自動清理 |
| Issue due date 更新與 Label PUT 無跨欄位交易 | 更新後重新讀取實際 Gitea 資料；回傳欄位級部分失敗，不宣稱整體成功 |
| Board 多 Repository、全部分頁讀取延遲或中途失敗 | 併發限制需依現有 API pattern 實作；任何必要分頁失敗顯示整體載入錯誤，不回傳看似完整的部分 Board |
| Gitea instance 版本與 due_date API 行為可能不同 | Gitea 官方 API 定義 `Issue.due_date` 與建立/編輯欄位；整合驗收仍需在目標內網 Gitea instance 執行 |
| Issue 的 start date label 被一般使用者改壞或重複 | Strict parser 將錯誤/重複/倒序日期標成 anomaly；不挑一個值當正確排程 |

## Complexity Tracking

無 Constitution gate violation；不新增 workspace、服務或資料庫。
