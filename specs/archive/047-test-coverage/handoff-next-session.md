# Handoff：下一階段測試補強

## 目前基線

- API/domain：`pnpm.cmd test:api`，13 個測試；涵蓋 Status resolver、Gitea error mapping、delegated token、403、repository permission fail-closed、Label atomic replacement/stale version，以及 Fastify session/health contract。
- Web 純邏輯：`pnpm.cmd test:web`，3 個工作檢視 URL state 測試。
- Browser：`pnpm.cmd test:e2e`，1 個 mocked Kanban card loading/column-scroll 測試。
- `pnpm.cmd format:check` 已通過。最近提交：`09c4154 style: format repository with Prettier`、`0cfa526 style(testing): format test coverage changes`。
- 本 handoff 不要求新增產品行為或改 Gitea contract；每個 Gitea 呼叫都用測試替身，禁止使用正式 credentials/data。

## 建議優先順序

### P1：Authenticated API 寫入整合測試

使用 Fastify `inject()`、測試簽章 session cookie 與 mock Gitea HTTP，走過真實 route → permission check → service → Gitea adapter。

- 驗證使用者沒有 repository `push` 權限時，Issue create/update/comment/status transition 回 403，且 Gitea write request 次數為 0。
- 驗證有權限時，transition 保留一般 Labels、只替換 workflow Labels，並以一次 atomic replacement 寫回。
- 驗證 `expectedUpdatedAt` 過期或 Gitea 回報版本衝突時回 409，Portal 不回報成功。
- 檢查 CSRF/session 邊界：缺 session、錯誤簽章、過期 session 與缺 CSRF token 的寫入請求都被拒絕。

### P1：Gitea adapter 故障案例

擴充 `apps/api/test/gitea/client.test.ts` 與 `apps/api/test/helpers/mock-gitea.ts`。

- 覆蓋 401、403、404、429、500、空 body、非 JSON/不完整 JSON 與 timeout。
- 確認錯誤 status/message 保留、timeout 轉成 Portal 可辨識錯誤，且錯誤 log 不包含 delegated token。
- 每個測試結束都還原 `globalThis.fetch`；測試並行執行時避免互相覆寫 fetch（可改用 Node mock API 或 worker isolation）。

### P1：Web 元件互動測試

目前 `test:web` 只測純 URL state，沒有 DOM/component 測試。先確認可使用原 workspace store `D:\.pnpm-store` 安裝測試套件；若採 Vitest，加入 React Testing Library、user-event、jsdom 與獨立 `test:unit` script。

- 測 `WorkViewFilterBar`：單選/多選、清除篩選、URL 更新與空結果。
- 測 keyboard operation、disabled/error state、長文字/不同語系下仍可操作。
- 測試只涵蓋使用者可觀察行為；不要把 React state implementation 細節寫進 assertions。

### P2：關鍵 Issue 狀態 E2E

新增一條 Playwright 流程，以 route mocks 提供 session、Repository、Issue 和 transition response。

- 從 Issue 或 Kanban 操作 Todo → In Progress，確認 UI 更新與狀態 Label 顯示。
- mock 409 concurrency conflict 和 403 permission denied，確認錯誤可見且卡片/狀態不呈現為已保存。
- 保留既有 Kanban scroll E2E；不要讓 browser tests 連正式 Gitea。

## 建議實作順序與驗收

1. 先補 authenticated API write/permission/409 測試，並用 `pnpm.cmd test:api` 驗證。
2. 再建立 Web DOM test runner，補 FilterBar interaction，獨立執行 Web unit/component suite。
3. 最後增加狀態轉換 E2E，執行 `pnpm.cmd test`、`pnpm.cmd typecheck`、`pnpm.cmd build`、`pnpm.cmd format:check` 與 `git diff --check`。
4. 測試不使用真實 Gitea、credentials 或 persistent fixtures；測試失敗需非零 exit code。

## 下一個 session 起手式

```powershell
git status --short --branch
pnpm.cmd test
pnpm.cmd typecheck
pnpm.cmd build
```

先看目前工作樹與執行結果，再從 P1 authenticated API 寫入整合測試開始。
