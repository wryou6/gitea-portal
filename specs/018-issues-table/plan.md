# Implementation Plan: Issues 表格與 Status 統一

**Branch**: `018-issues-table` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/018-issues-table/spec.md`

## Summary

將 All repos 與 Repository Issues 頁面改為可排序、可分享 URL 狀態的 10 欄資料表，每頁最多 50 筆；維持 Gitea 為 Issue 唯一資料來源。Issues table 新增 View Options，可設定八個可選欄位的顯示及單一預設排序，依登入帳號保存於一年期 cookie；使用者直接拖曳表頭欄位名稱即時調整欄序，並可從表格上方的「設為預設欄位順序」按鈕保存新預設。View Options 先顯示兩項設定選單，再顯示選取的設定；重排提供鍵盤操作並使用尊重減少動態效果設定的動畫。明確 URL 排序優先，沒有 URL 排序時使用個人預設。維持三語文字與 Gitea 同義用字一致，沿用既有 UI 元件並以 Storybook 展示主要狀態。同步把目前 Portal Status 模型、API、設定、介面及維護文件統一使用 Status 命名，並將 Gitea 狀態與動作原因 Label 遷移到 `status:` 與 `status-action:`。遷移使用目前使用者的 Gitea 權限，依 Issue 逐筆以既有 label 全集替換、樂觀檢查及回讀驗證；只有完整掃描驗證無舊 prefix 後才切換至不含舊相容邏輯的版本。

## Technical Context

**Language/Version**: TypeScript 5.x、React 19、Node.js ESM，pnpm workspace

**Primary Dependencies**: Fastify、React、Vite、i18next、現有 Gitea HTTP client、Storybook

**Storage**: Gitea Issues 與 Labels；View Options 是帳號隔離的純介面偏好 cookie，有效期一年；不新增 Portal Issue 或遷移進度持久化

**Testing**: `pnpm.cmd typecheck`、`pnpm.cmd build`、Issues Table/View Options Storybook；既有 API/domain 測試按受影響範圍執行；驗證 cookie reload/account isolation、URL sort precedence、鍵盤 reorder 與三語文字

**Target Platform**: 內網瀏覽器應用與 Node.js API

**Project Type**: pnpm monorepo（`apps/api`、`apps/web`、`packages/domain`、`packages/gitea-contracts`）

**Performance Goals**: 單頁最多傳回 50 筆；排序及篩選先對該次讀取範圍的完整 Issue 集合套用，再分頁。跨 Repository 必須完整讀取必要資料，失敗不得回傳部分集合。

**Constraints**: Gitea 是 Issue 資料唯一來源，Portal 允許保存 View Options 介面偏好；所有 API 使用目前登入者授權；Label 更新保留無關 Labels，使用單次全集替換、樂觀版本檢查與回讀驗證；逾期樣式僅限日期值；支援語系沿用 Gitea 相同語意的介面用字；UI 使用 `$ui-styling`、`$ui-ux-pro-max` 和 Storybook 設計驗收；拖拉排序需提供鍵盤拖曳替代。

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
| View preference | 個人化設定不屬於 Issue 資料 | 僅保存欄位可見性、順序及預設排序；不保存 Issue 或 Gitea 權限資料 | PASS |
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
│   ├── status-label-migration.md
│   └── issue-view-options.md
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
├── features/issues/      # Issues table、View Options、排序、篩選、分頁、Storybook
├── features/work-views/  # Kanban/Gantt 使用 Status 呈現
├── i18n/                 # 所有語系的 Status、table、View Options 與 migration 文字
├── lib/api.ts            # 新 Status contracts
└── index.css             # table/date/status 樣式

packages/domain/src/      # Issue Status、Status action、resolver、view types
packages/gitea-contracts/ # 對外 Portal view/input contracts
specs/018-issues-table/   # 本功能 artifacts
```

**Structure Decision**: 維持既有 pnpm monorepo，不增設服務、固定設定檔或 Portal persistence；固定 Status 定義由 `packages/domain/src/status.ts` 提供，跨層 contract 由 domain package 共用。Portal 管理入口及 API 僅接受 `admin` 登入者操作，並組合該登入者的 Gitea client、Repository 權限檢查與既有原子 Label replacement。

## UI refinement: table reorder, default sort, and reset

**Supersedes the initial View Options sort controls and text-only drag source described in the original feature outline.**

- HTML drag source covers the full `<th>` hit area so whitespace in a header can start reordering; retain the existing keyboard reorder flow on its sort button.
- Render a sort direction glyph only for the active sort field. Keep `aria-sort` on all header cells.
- Simplify View Options to the visible-column controls. Save the current sort as the default from the table toolbar when it differs from the cookie preference.
- Show compact accent actions for unsaved column order and sort. Let the toolbar wrap naturally, retaining a clear action hierarchy with View Options.
- Show a restore-default action when any saved preference or current view differs from the product defaults. Restore all columns visible, the initial column order, Key ascending as both saved and current sort, and sync the URL.
- Add Storybook states for order pending, sort pending, both pending, restored defaults, and narrow toolbar layout; keep fixtures deterministic and locale-provider-backed.

View Options 只在 Web 使用，登入名稱由 `App` 傳入 `IssueListPage`，不新增 session API 呼叫。重用 `components/ui/Dialog.tsx`、`Button.tsx` 與 `Table.tsx`；設定對話框先提供欄位可見性與預設排序兩項入口，再顯示各自的欄位 checkbox 或排序欄位/方向控制。表頭欄位名稱本身是 pointer 拖放起點；鍵盤操作在可排序表頭按鈕上使用 Shift+Space 抓取、左右方向鍵移動、Space 放下、Escape 取消，不使用專用握把或方向按鈕。表頭重排只改當次欄序；若不同於保存值，表格上方顯示保存按鈕，按下後寫入完整預設欄序 cookie 並立即套用。重排時使用短距離 FLIP 動畫並尊重減少動態效果偏好。Dialog 開啟時將焦點置於關閉按鈕，Esc/關閉後回復到觸發按鈕。偏好以純函式 cookie helper 讀寫；Storybook 注入明確的 demo preferences，不讀寫真實瀏覽器 cookie。

### Current UI decisions (2026-09-29; supersedes the initial menu/drag notes above)

View Options opens directly to column visibility only. Save the active table sort from the toolbar; make the entire header cell draggable, show arrows only for the active sort, and provide a toolbar action that restores visibility, order, saved sort, current sort, and URL to product defaults.

## Complexity Tracking

無 Constitution 例外。逐 Issue 原子更新不是全域交易；部分成功須可從 Gitea 現況重跑，完成判斷必須獨立執行全範圍讀取驗證。
