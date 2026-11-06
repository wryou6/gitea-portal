# Research: 分層自動化測試補強

## 決策：沿用現有 API test runner

- **Decision**: API route/service tests 使用已安裝的 `node:test`、tsx 與 Fastify `inject()`。
- **Rationale**: 現有 API tests 已採用此模式，inject 可經過完整 route pipeline 而不啟動 listener。
- **Alternatives considered**: 新增 Vitest/Jest；對 API integration 不提供必要優勢且增加依賴。

## 決策：使用 Vitest 與 Testing Library 驗證 React 元件互動

- **Decision**: WorkViewFilterBar 使用 Vitest、React Testing Library、user-event 與 jsdom；Kanban transition 留在 Playwright E2E。
- **Rationale**: handoff 要求 component tests 可獨立執行；DOM runner 能快速驗證元件互動而不啟動 API/browser server。測試套件採 dev-only dependencies。
- **Alternatives considered**: 全部使用 Playwright；無法提供獨立的 component test suite，且執行成本較高。

## 決策：隔離 Gitea HTTP 故障測試

- **Decision**: adapter tests 使用 per-test fetch stub；需要讀取/寫入 log 時注入測試 logger 或攔截專屬 logger，不共用可變全域 fetch。
- **Rationale**: 可以精確注入 HTTP response、timeout 和意外 request，並避免測試間污染。
- **Alternatives considered**: 真實 Gitea instance；無法安全或穩定模擬錯誤，不符合無正式 credentials 的要求。

## 決策：覆蓋依風險案例，不設全域 coverage gate

- **Decision**: 驗收以 spec 中的 route 權限、原子 label replacement、adapter failures、UI transition 結果作為明確案例。
- **Rationale**: 延續既有 feature 決定，聚焦可證明的資料與權限邊界。
- **Alternatives considered**: 全域 coverage percentage；目前沒有基線且不能取代高風險行為斷言。
