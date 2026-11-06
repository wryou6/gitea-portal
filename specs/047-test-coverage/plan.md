# Implementation Plan: 分層自動化測試

**Branch**: `047-test-coverage` | **Date**: 2026-11-06 | **Spec**: [spec.md](spec.md)

**Input**: 為 Gitea Portal 建立 API/domain、Web、contract 與少量 E2E 測試。

## Summary

為現有 pnpm workspace 增加可重複執行的 API/domain、Web 純邏輯、contract 與少量 Playwright 測試。API 和 Web 純邏輯使用 Node.js 內建測試 runner，透過 API workspace 既有 tsx 執行；UI 互動由既有 Playwright E2E 驗證。Gitea HTTP 呼叫使用可控制的 mock，不連正式 Gitea。以必要風險案例定義完成條件，不設全域 coverage 百分比。

## Technical Context

**Language/Version**: TypeScript, Node.js 22, pnpm 9
**Primary Dependencies**: Fastify 5、React 19、Playwright 1.63、既有 tsx
**Storage**: N/A；測試使用記憶體 fixture/mock
**Testing**: API/domain 與 Web 純邏輯使用 `node:test` 經 `tsx --test` 執行；互動與跨層使用既有 Playwright
**Target Platform**: Windows 開發環境與 CI Node.js 環境
**Project Type**: pnpm monorepo，Fastify API + React Web + 共用 TypeScript packages
**Performance Goals**: 單元與元件測試不啟動外部服務；全套分層測試可由明確指令執行
**Constraints**: 不使用正式 Gitea、credentials 或正式資料；保留既有 E2E 執行方式；不得改變產品 API 或 Gitea 權限語意
**Scale/Scope**: 建立各測試層基礎設施與高風險代表案例，不追求全程式覆蓋率

## Constitution Check

通過。新增測試只觀察或 mock Gitea 行為，不新增 Issue mirror、Portal persistence 或提升服務權限。覆蓋 Issue Status/Label 原子更新與權限界線；型別與 contract 變更仍須跨 packages、API、Web 檢查。測試不改變使用者可見產品行為。

## Project Structure

### Documentation (this feature)

```text
specs/047-test-coverage/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/api/
├── src/
└── test/                 # node:test API/domain/contract tests
apps/web/
├── src/
├── test/                 # Vitest logic/component/contract tests
└── e2e/                  # existing and critical Playwright flows
packages/domain/src/
packages/gitea-contracts/src/
```

**Structure Decision**: 測試與被測 workspace 各自同層存放。API 以 Fastify `inject()` 驗證 route，不啟動網路 listener；Gitea adapter 以可攔截 HTTP 的 mock 驗證 request/response 和錯誤轉換。Web 純邏輯透過既有 tsx 執行，互動由少量 Playwright E2E 覆蓋，沿用既有 webServer 設定；純版面測試仍依 repo 指引採 production CSS + `page.setContent()`。

## Phase 0: Research Decisions

見 [research.md](research.md)：以 Node 內建 runner 避免 API/domain 引入額外 runner；Web 採 Vitest 與 Testing Library；外部 Gitea 以 HTTP mock 隔離。

## Phase 1: Design

- 測試案例與 fixture 都是測試專用資料，不建立產品資料模型或持久化。
- root/workspace scripts 明確提供 API/domain、Web unit/component、E2E、全套指令。
- API route contract 透過 Fastify inject 的序列化回應斷言；domain/status contract 以代表性輸入輸出測試，避免只依賴 TypeScript 編譯。
- quickstart 列出安裝、各層指令、全套指令及預期結果。

## Constitution Check (post-design)

通過。所有 Gitea 測試呼叫均為 mock，驗證 delegated permission、atomic label replacement 和 concurrency conflict；不連接正式系統，不改產品權限或資料來源。
