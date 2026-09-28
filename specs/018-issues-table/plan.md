# Implementation Plan: Issues 表格與 Status 統一

**Branch**: `018-issues-table` | **Date**: 2026-09-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/018-issues-table/spec.md`

## Summary

將 All repos 與 Repository Issues 頁面改為可排序、可分享 URL 狀態的 10 欄資料表，每頁最多 50 筆；維持 Gitea 為 Issue 唯一資料來源。同步把目前 Portal Status 模型、API、設定、介面及維護文件統一使用 Status 命名，並將 Gitea 狀態與動作原因 Label 遷移到 `status:` 與 `status-action:`。遷移使用目前使用者的 Gitea 權限，依 Issue 逐筆以既有 label 全集替換、樂觀檢查及回讀驗證；只有完整掃描驗證無舊 prefix 後才切換至不含舊相容邏輯的版本。

## Technical Context

**Language/Version**: TypeScript 5.x、React 19、Node.js ESM，pnpm workspace

**Primary Dependencies**: Fastify、React、Vite、i18next、現有 Gitea HTTP client、Storybook

**Storage**: Gitea Issues 與 Labels；不新增 Portal Issue 或遷移進度持久化

**Testing**: `pnpm.cmd typecheck`、`pnpm.cmd build`、Issues Table Storybook；既有 API/domain 測試按受影響範圍執行

**Target Platform**: 內網瀏覽器應用與 Node.js API

**Project Type**: pnpm monorepo（`apps/api`、`apps/web`、`packages/domain`、`packages/gitea-contracts`）

**Performance Goals**: 單頁最多傳回 50 筆；排序及篩選先對該次讀取範圍的完整 Issue 集合套用，再分頁。跨 Repository 必須完整讀取必要資料，失敗不得回傳部分集合。

**Constraints**: Gitea 是唯一資料來源；所有 API 使用目前登入者授權；Label 更新保留無關 Labels，使用單次全集替換、樂觀版本檢查與回讀驗證；逾期樣式僅限日期值；所有現行語系與 Storybook fixture 同步更新。

**Scale/Scope**: All repos 可讀 Repository 與指定 Repository 的全部 Issue；狀態遷移須可重跑、逐 Issue 回報成功／失敗／衝突，並以完整目標範圍驗證作為切換條件。

## Constitution Check

| Gate | 規範 | 設計處理 | 狀態 |
|---|---|---|---|
| I | Gitea 是 Issue 資料唯一來源 | 表格只呈現既有 Gitea 欄位與 Label 推導值；不新增 Issue mirror 或遷移 checkpoint | PASS |
| II | 操作遵循目前使用者權限 | 唯一遷移操作者為 Gitea `admin`；列舉、讀取、遷移都使用該請求所帶登入者 token；無後端服務身份旁路 | PASS |
| III | Gitea 寫入保全資料並可驗證 | 僅替換目標 prefix；保留其餘 Labels；使用現有樂觀檢查、PUT 全集替換、GET 驗證；衝突不靜默修補 | PASS |
| IV | 聚合讀取不可呈現部分結果 | 搜尋與 migration verification 的必要 Repository／Issue 頁面任一讀取失敗即整體回報錯誤，不宣布完成 | PASS |
| V | 各 Repository 狀態語意一致 | 三態 Portal Status 對應 Todo/In Progress/Done；Done 仍由原生 Closed 表示；同步更新本原則及維護文件名稱 | PASS，文件更新屬實作範圍 |
| VI | 工作範圍明確 | Key 固定顯示 `owner/repo#number`；遷移回報指出 repository 與 issue | PASS |
| VII | 使用者文字多語系 | 表頭、排序名稱、逾期提示、分頁、錯誤及遷移結果更新所有現有語系 | PASS |
| Workspace constraints | 共用契約需跨層同步 | 一併檢查 domain、gitea-contracts、API、Web 型別 | PASS |
| Spec Kit gates | UI 變更須保有 Spec Kit artifacts 並 typecheck/build | 本 feature 維護 plan/tasks/analyze，實作後依規範執行 typecheck/build | PASS |

## Project Structure

### Documentation (this feature)

```text
specs/018-issues-table/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── issues-query.md
│   ├── status-definition.md
│   └── status-label-migration.md
└── tasks.md
```

### Source Code

```text
apps/api/src/
├── http/                 # Status definition 與 migration API
├── issues/               # 排序查詢、Issue mapping、Status transition 與 migration
├── gitea/                # 目前登入者 client、原子 Label replacement
└── work-views/           # Kanban Status 檢視

apps/web/src/
├── features/issues/      # Issues table、排序、篩選、分頁、Storybook
├── features/work-views/  # Kanban/Gantt 使用 Status 呈現
├── i18n/                 # 所有語系的 Status、table 與 migration 文字
├── lib/api.ts            # 新 Status contracts
└── index.css             # table/date/status 樣式

packages/domain/src/      # Issue Status、Status action、resolver、view types
packages/gitea-contracts/ # 對外 Portal view/input contracts
specs/018-issues-table/   # 本功能 artifacts
```

**Structure Decision**: 維持既有 pnpm monorepo，不增設服務、固定設定檔或 Portal persistence；固定 Status 定義由 `packages/domain/src/status.ts` 提供，跨層 contract 由 domain package 共用。Portal 管理入口及 API 僅接受 `admin` 登入者操作，並組合該登入者的 Gitea client、Repository 權限檢查與既有原子 Label replacement。

## Complexity Tracking

無 Constitution 例外。逐 Issue 原子更新不是全域交易；部分成功須可從 Gitea 現況重跑，完成判斷必須獨立執行全範圍讀取驗證。
