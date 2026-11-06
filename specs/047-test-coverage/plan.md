# Implementation Plan: 分層自動化測試

**Branch**: `047-test-coverage` | **Date**: 2026-11-06 | **Spec**: [spec.md](spec.md)

**Input**: 擴充既有測試，增加認證寫入整合、Gitea 故障、篩選器互動與 Kanban 狀態轉換案例。

## Summary

延用既有 Node `node:test`、tsx、Fastify inject 與 Playwright，並新增 Vitest、Testing Library、user-event、jsdom 作為獨立 Web component runner。API 寫入測試由真實 route 經 permission/service 至 mock Gitea HTTP；adapter 故障測試隔離 fetch 並檢查錯誤與 token 日誌；WorkViewFilterBar 由 component suite 測試，Kanban transition 使用 Playwright route mocks。所有寫入只送至測試替身。

## Technical Context

**Language/Version**: TypeScript, Node.js 22, pnpm 9
**Primary Dependencies**: Fastify 5、React 19、Playwright 1.63、tsx、Vitest、Testing Library、user-event、jsdom
**Storage**: 無；使用測試內記憶體 fixtures
**Testing**: `node:test` + Fastify inject；Vitest + Testing Library + jsdom 測 Web component；Playwright E2E 使用 route mocks
**Target Platform**: Windows 開發環境與 CI Node.js 環境
**Project Type**: pnpm monorepo，Fastify API + React Web + 共用 TypeScript packages
**Performance Goals**: API tests 不啟動 listener；UI flow 不連正式 Gitea；測試透過 workspace scripts 分層執行
**Constraints**: 只新增 test-only dependencies；不改產品 API/權限語意、不使用正式 credentials/data；全域 fetch mock 必須復原且不可由並行測試共用
**Scale/Scope**: 僅補 handoff 列出的高風險案例，不設 coverage 百分比

## Constitution Check

通過：測試只驗證現有使用者權限與 Gitea 唯一資料來源，不新增持久化或高權限代理；驗證狀態/Label 原子替換及並行衝突，不改產品寫入行為。

## Project Structure

```text
apps/api/test/routes/       # authenticated write route integration
apps/api/test/gitea/        # adapter failure contracts
apps/api/test/helpers/      # isolated mock helpers
apps/web/test/              # WorkViewFilterBar component tests
apps/web/e2e/               # Kanban transition browser flows
specs/047-test-coverage/    # plan, research, tasks, data model, quickstart
```

**Structure Decision**: 沿用既有純邏輯 `node:test` 與 Playwright runner，另以 Vitest/Testing Library/jsdom 提供快速、獨立的 React component tests。E2E 僅驗證跨層狀態轉換，API 均由 `page.route` 控制。

## Phase 0: Research Decisions

見 [research.md](research.md)：沿用 API/E2E 工具，新增 Web component test dependencies；route integration 使用 Fastify inject 和簽章 session；adapter mock 不並行改寫全域 fetch。

## Phase 1: Design

- 測試 fixtures 不含真實 credentials；mock 預設拒絕未預期的 Gitea request。
- 寫入 API 依 route 專屬權限驗證 issue create/update/comment/status transition，拒絕路徑斷言零次 Gitea write。
- 狀態成功路徑驗證一般 labels 保留、workflow labels 單次 atomic replacement；版本競態驗證 409。
- Adapter failures 覆蓋 401/403/404/429/500、空/非 JSON body、timeout，敏感 token 不得出現在 log。
- Vitest component tests 驗證篩選器互動；Playwright 驗證 Kanban transition 成功/403/409，失敗後確認 UI 回復伺服器狀態，並保留 scroll case。
- `quickstart.md` 列出 API、Web、E2E、全套、typecheck/build/format 指令。

## Constitution Check (post-design)

通過。沒有產品資料或 API 變更；Gitea 權限由目前使用者 session mock 表達，所有 Gitea HTTP request 被攔截。測試案例明確驗證 atomic write、conflict 與不洩漏 delegated token。
