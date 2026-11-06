# Research: 分層自動化測試

## 決策：API/domain 使用 Node.js 內建測試 runner

- **Rationale**: API 已有 tsx，Node.js 22 提供 `node:test`，避免為純 TypeScript API/domain 邏輯再引入一套 runner。Fastify 原生 `inject()` 可測 routes 而不開啟 listener。
- **Alternatives considered**: Vitest 全 workspace；會讓 API 額外引入前端測試 runner。Jest；需要額外轉譯設定。

## 決策：Web 純邏輯使用 Node.js 內建 runner

- **Rationale**: pnpm 目前因既有 node_modules 綁定到不同 store 而拒絕新增依賴；使用 API workspace 已安裝的 tsx 可立即建立不依賴 DOM 的前端純邏輯測試，避免改動 lockfile 或全量重裝。
- **Alternatives considered**: Vitest + Testing Library + jsdom；需成功調整 store 並安裝額外 dependencies。UI component interaction 由現有 Playwright E2E 驗證。

## 決策：外部 Gitea 呼叫使用可控制的 HTTP mock

- **Rationale**: 測試可覆蓋成功、拒絕、timeout、異常回應與並行衝突，同時不依賴正式帳號、credentials 或網路狀態。
- **Alternatives considered**: 必須安裝本機 Gitea；環境成本高且難以測試故障回應。可選真實 Gitea smoke test 不屬於此 feature 的必要範圍。

## 決策：不設定全域 coverage gate

- **Rationale**: 專案尚無測試基線，總百分比容易鼓勵低價值覆蓋。以權限委派、Status/Label 原子更新/衝突、contract 錯誤處理及主要 Web 邏輯列為明確必測項。
- **Alternatives considered**: 立即設定總覆蓋率門檻；沒有現有測量基線，不能證明門檻能提升風險覆蓋。
