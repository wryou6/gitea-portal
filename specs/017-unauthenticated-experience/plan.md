# Implementation Plan: 登入狀態與 Session 處理

**Branch**: `017-unauthenticated-experience` | **Date**: 2026-09-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/017-unauthenticated-experience/spec.md`

## Summary

在 Web 啟動時區分已登入、未登入及 session 狀態無法確認；未登入時顯示獨立登入頁，session 過期時清除已失效 session 並透過重新載入保護目前導覽位置後顯示登入頁。已登入使用者可從帳戶選單登出；收到 API 成功確認後清除 Portal session cookies、切換至獨立登入頁，保留 Gitea IdP 登入狀態，失敗時留在登入後畫面並顯示可重試錯誤。沿用 Gitea OAuth 與 Portal session，驗證一次性 OAuth state 並安全保留回跳位置；不保存 Issue 草稿。

## Technical Context

**Language/Version**: TypeScript 5.8、Node.js 22

**Primary Dependencies**: React 19、Vite、Fastify 5、i18next；不新增 runtime dependency

**Storage**: 現有 Portal HttpOnly session cookie；短效 HttpOnly OAuth transaction cookie 綁定 state 與回跳位置；`sessionStorage` 只保存 session 過期提示旗標，不保存表單資料

**Testing**: Web/API TypeScript typecheck、workspace build、Storybook 登入狀態案例、依 quickstart 手動驗證 OAuth 深連結與故障流程

**Target Platform**: 現有 Portal 支援的桌面與窄螢幕瀏覽器；Web 與 API 維持目前部署方式

**Project Type**: pnpm monorepo web application，包含 React Web 與 Fastify API

**Performance Goals**: 不增加額外的啟動網路往返；初始 session 查詢沿用既有單次 `/api/session` 請求

**Constraints**: 未登入不得載入受保護工作資料；OAuth access token 僅留於後端 session；只允許已知 Portal 路由作為回跳位置；session 查詢 401 與其他錯誤必須分流；所有新增文案支援繁中、英文、日文；不得保存未送出的 Issue 欄位

**Scale/Scope**: 單一 Portal 登入頁、三種 session bootstrap 狀態、既有 Gitea OAuth callback 與 Portal 登出；不新增帳號管理或 Issue 草稿功能

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Gitea 為權限與資料來源**: PASS — 續用登入者的 Gitea OAuth 身分，不新增共享憑證或 Issue mirror。
- **不擴大登入者權限**: PASS — 所有受保護 API 仍以目前使用者的 delegated session 執行；401 只觸發重新登入，不重試原寫入。
- **憑證保護**: PASS — OAuth access token 不進入 Web；OAuth state/return target 放在短效 HttpOnly cookie，回跳位置限於已知同站路由。
- **狀態與錯誤需明確呈現**: PASS — 已登入、未登入、登入失敗及 session 查詢服務錯誤各自呈現。
- **多語系與可存取性**: PASS — 登入與錯誤文案更新 zh-TW/en/ja，使用原生連結／按鈕及可辨識狀態訊息，涵蓋鍵盤、主題及窄螢幕。
- **未送出資料不持久化**: PASS — 僅恢復 URL；不儲存或還原表單欄位，重登後提供重新輸入提示。
- **登出只終止 Portal session**: PASS — logout endpoint 清除 Portal session 與 CSRF cookies，不呼叫 Gitea logout；前端只在收到成功回應後離開已登入介面。

## Phase 0: Research

研究決策及替代方案見 [research.md](./research.md)。無未解技術選擇或規格歧義。

## Phase 1: Design & Contracts

- [data-model.md](./data-model.md) 定義 session bootstrap、OAuth transaction、回跳位置及一次性過期提示的生命週期；不建立 Issue draft entity。
- [contracts/auth-flow.md](./contracts/auth-flow.md) 定義登入入口、OAuth callback、回跳驗證、三態 bootstrap 及 Portal 登出交互。
- [quickstart.md](./quickstart.md) 提供匿名、服務故障、OAuth 成功／失敗、session 逾期、Portal 登出、無效回跳與鍵盤／響應式驗證步驟。

## Project Structure

### Documentation (this feature)

```text
specs/017-unauthenticated-experience/
├── plan.md
├── research.md
├── data-model.md
├── contracts/auth-flow.md
├── quickstart.md
└── tasks.md
```

### Source Code

```text
apps/api/src/auth/                 OAuth state transaction validation
apps/api/src/http/routes.ts        Login and callback redirects
apps/api/src/auth/session.ts       Portal session and CSRF cookie lifecycle
apps/api/src/http/error-handler.ts Clear rejected delegated session
apps/web/src/main.tsx              Session bootstrap tri-state
apps/web/src/app/App.tsx           Authenticated shell gate and expired notice
apps/web/src/components/layout/AppShell.tsx Account menu and confirmed logout action
apps/web/src/app/routes.ts         Known-route return target validation
apps/web/src/features/auth/        Login and session-unavailable views
apps/web/src/i18n/resources/auth.ts Localized auth and logout errors
apps/web/src/i18n/resources/common.ts Localized account-menu logout label
apps/web/src/index.css             Login page responsive/theme styles
apps/web/src/features/auth/*.stories.tsx
                                   Login and error-state stories
apps/web/vite.config.ts            Development /auth proxy
```

**Structure Decision**: 維持既有 workspace 邊界。React 登入體驗置於 `apps/web`；OAuth state 與 redirect policy 留在 `apps/api`；前後端契約用 feature 文件描述，不新增資料庫、package 或 OAuth dependency。

## Complexity Tracking

無憲章例外，不需額外複雜度豁免。
