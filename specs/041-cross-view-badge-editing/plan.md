# Implementation Plan: 三個工作檢視的 Badge 快速編輯

**Branch**: `041-cross-view-badge-editing` | **Date**: 2026-10-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/041-cross-view-badge-editing/spec.md`

## Summary

在 Issue List、Kanban 與 Gantt 共用可鍵盤操作的優先級／類型彈出選單；Issue List 與 Gantt 狀態 badge 開啟既有 `StatusTransitionDialog`。Kanban 狀態仍由拖曳欄位操作。Web 將保存請求集中在持有檢視資料的頁面，成功後重載目前檢視，失敗時保留原 Gitea 值並顯示錯誤。沿用現有 PATCH 與狀態轉換端點，不新增 API、持久資料或 Gitea 權限規則。

## Technical Context

**Language/Version**: TypeScript 5.8, Node.js 22

**Primary Dependencies**: React 19, React Router 8, react-i18next 17, Fastify 5, pnpm 9 workspace

**Storage**: Gitea Issue 與 Repository Labels 為唯一資料來源；Portal 不新增持久化。

**Testing**: 專案無 Web unit-test runner；使用 Storybook stories/build 作為元件呈現檢視，並依專案要求執行 `pnpm.cmd typecheck`、`pnpm.cmd build`。使用開發 Gitea 的人工情境檢查實際寫入、權限與競爭更新。

**Target Platform**: 內網桌面／窄螢幕瀏覽器；繁體中文、英文、日文。

**Project Type**: pnpm monorepo web application (`apps/web`, `apps/api`, `packages/domain`, `packages/gitea-contracts`)

**Performance Goals**: 編輯動作不增加檢視載入範圍；完成一次既有 Issue 更新後重新載入目前檢視。

**Constraints**: 每次更新需帶 `expectedUpdatedAt`；優先級／類型 Labels 必須沿用原子 replacement；Status 不可繞過既有動作原因、負責人政策與確認流程；修改依目前使用者 Gitea 權限執行。

**Scale/Scope**: 僅涵蓋 Issue List、Kanban Card 與 Gantt row 的 Type／Priority 編輯，以及 Issue List／Gantt 的 Status 操作入口。

## Constitution Check

| 原則 | 設計符合方式 | 狀態 |
|---|---|---|
| I. Gitea 是唯一來源 | 使用既有讀寫路徑，成功後重載 Gitea 資料；無 Portal Issue mirror | PASS |
| II. 權限跟隨目前使用者 | 沿用 delegated request 與 API 權限檢查，不提供額外高權限操作 | PASS |
| III. 保全資料並可驗證 | PATCH 帶版本戳，欄位標籤沿用 atomic replacement；Status 使用既有 transition rollback/error path | PASS |
| V. 固定 Status 語意 | 不新增或改寫狀態值；anomaly 不可操作 | PASS |
| VII. 使用者可見文字多語系 | 新選單、錯誤、無障礙名稱同步 zh-TW/en/ja | PASS |

**Post-design gate**: PASS；不新增持久資料、API contract 或資料庫變更。

## Design Decisions

1. 建立共用工作檢視 metadata badge editor，讓 Priority 與 Type 共用選單、保存中／失敗狀態、重試與取消行為；候選值採原有 domain enum。選取後立即送出；成功關閉選單，失敗保留選單並呈現錯誤，badge 顯示從 Gitea 載入的值。
2. 將 Issue 身分、`updatedAt` 和欄位更新 callback 由 List／Kanban／Gantt 的資料擁有者往 row/card 傳遞。保存成功後重載目前查詢，使篩選、排序及跨 Repository 彙整與遠端資料一致。
3. List 與 Gantt 點狀態 badge 時開啟無 `targetState` 的既有 `StatusTransitionDialog`，由使用者選擇目前狀態適用的動作；完成後沿用 `transitionIssue` 並重載。Kanban 卡片不加 Status badge，拖曳及卡片內按鈕需避免互相觸發。
4. Badge trigger 使用語意化 button；選單以原生可聚焦控制提供各值，支援鍵盤開啟、選取、取消／關閉及清楚的目前選取提示。狀態異常維持不可操作且可辨識。
5. 不新增後端 endpoint 或 domain value。Type／Priority 使用 `PATCH /api/issues/:owner/:repo/:number`，只傳被編輯欄位與 `expectedUpdatedAt`；狀態使用目前 transition endpoint。

## Project Structure

### Documentation (this feature)

```text
specs/041-cross-view-badge-editing/
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   └── issue-badge-interactions.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/web/src/components/ui/           # 共用互動 badge 選單
apps/web/src/features/issues/         # Issue List rows、狀態流程與更新 callback
apps/web/src/features/work-views/     # Kanban Card、Gantt rows 與父層資料重載
apps/web/src/i18n/resources/issues.ts  # 三語選單、狀態與錯誤文字
apps/web/src/index.css                # 選單定位、焦點、窄螢幕與 badge 樣式
```

**Structure Decision**: 僅修改現有 Web UI 元件與其資料擁有者；API 與 domain 已具有本功能所需的值域及寫入行為，因此不擴充 workspace packages 或 API contract。

## Complexity Tracking

無憲章例外或額外複雜度。
