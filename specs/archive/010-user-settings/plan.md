# Implementation Plan: 使用者選單與外觀設定

**Branch**: `010-user-settings` | **Date**: 2026-09-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/010-user-settings/spec.md`

## Summary

在 Portal Web header 加入已登入帳號選單與「設定」連結，新增 `/settings` 外觀設定頁。重用現有 `/api/session` 回傳的 Gitea login；不改 API 或伺服器資料。Light、Dark、System 偏好依 login 分別保存在瀏覽器本機，並以既有 `.dark` CSS theme class 套用外觀。

## Technical Context

**Language/Version**: TypeScript 5.8、React 19

**Primary Dependencies**: Vite 6.1、Tailwind CSS 4；不新增套件

**Storage**: Web Storage `localStorage`，以 Portal login 分隔偏好；無伺服器端保存

**Testing**: `pnpm.cmd typecheck`、`pnpm.cmd build`；依 `quickstart.md` 手動驗證 UI 情境

**Target Platform**: 現有桌面與行動瀏覽器 Web app；使用 `prefers-color-scheme` 支援 System 模式

**Project Type**: pnpm monorepo 的 Web application；本功能只改 `apps/web`

**Performance Goals**: 使用者選擇外觀後 1 秒內完成全站套用；初始帳號與偏好解析在首次畫面繪製前完成

**Constraints**: 保留既有 `/api/session` contract；不新增 API、資料庫或依賴；登入帳號未載入時採 System 外觀；本機快取無法存取時，當次仍可操作，重新載入後回復 System

**Scale/Scope**: 一個目前登入帳號、單一瀏覽器的外觀偏好；本次只在使用者選單中提供「設定」一項

## Constitution Check

`constitution.md` 目前仍是未填寫的範本，沒有可執行的 ratified principles。依 repo `AGENTS.md` 的既有界線檢查：

- **PASS**：不新增後端 persistence，不複製 Gitea 帳號或 Issue 資料；login 僅用於本機偏好分隔與顯示。
- **PASS**：不改動 API contract 或 Gitea 權限與資料；不新增 workspace package 或 dependency。
- **PASS**：UI 延用目前 React、手動 route resolver、CSS custom properties 與 `.dark` class。

## Design Decisions

1. **登入識別重用既有 session**：`GET /api/session` 已回傳 `{ login }`。Web 啟動時載入一次並傳給 App shell；不另外向 Gitea 查詢個人資料，也不擴充 API response。
2. **偏好按帳號隔離**：以 login 組成本機儲存項目名稱，值限 `light`、`dark`、`system`。缺值、無效值或儲存不可用時預設 System；儲存失敗不阻止當次切換。
3. **首屏套用方式**：在 mount React root 前取得 session 與該帳號偏好，先套用 `html.dark` 及 `color-scheme`，再顯示 App，避免先以另一帳號或預設主題閃現。
4. **System 模式**：用 `matchMedia('(prefers-color-scheme: dark)')` 決定有效主題，並在系統設定改變時更新；偏好本身仍保存為 `system`。
5. **路由與 UI**：在現有 `routes.ts` 加入 `/settings`；App 以現有 route switch 顯示設定頁。AppShell 右上角顯示 login 及可鍵盤操作的使用者選單；目前唯一動作是「設定」。
6. **不新增外部 API contract**：唯一資料請求沿用現有 session contract；以 UI contract 記錄 menu 與 settings page 的可見行為。

## Project Structure

### Documentation (this feature)

```text
specs/010-user-settings/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── settings-ui.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/web/index.html
apps/web/src/main.tsx
apps/web/src/app/App.tsx
apps/web/src/app/routes.ts
apps/web/src/components/layout/AppShell.tsx
apps/web/src/features/settings/SettingsPage.tsx
apps/web/src/features/settings/theme-preference.ts
apps/web/src/index.css
```

**Structure Decision**: 保持功能在 `apps/web`。既有 app shell、route resolver 與 theme CSS 為整合點；設定頁與本機偏好 helper 放在獨立 `features/settings` 目錄。沒有 API、domain package 或 server persistence 變更。

## Phase 0: Research

研究結果與替代方案見 [research.md](research.md)。沒有尚待解決的技術未知數。

## Phase 1: Design

- [資料模型](data-model.md)：本機、依 login 分隔的外觀模式偏好。
- [UI contract](contracts/settings-ui.md)：帳號選單與設定頁的可見互動。
- [Quickstart](quickstart.md)：執行與手動驗收情境。

## Post-Design Constitution Check

- **PASS**：設計只新增本機 UI 偏好，不保存 Gitea 帳號或 Issue mirror。
- **PASS**：既有 API、權限邊界、workspace 結構及 atomic Board store 均不受影響。
- **PASS**：設定頁與選單可獨立實作；主題狀態明確支援鍵盤與系統外觀。
