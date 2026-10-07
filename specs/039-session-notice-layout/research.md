# Research: 重新登入提示版面修正

## Decision: 將浮動提示掛載於視窗層級

- **Decision**: 在通知元件內使用 React DOM `createPortal` 將提示渲染到 `document.body`，並採視窗固定定位。
- **Rationale**: `App.tsx` 目前把提示當作 `.app-content` 的一般子項。工作檢視 shell 與內容使用固定高度及 `overflow: hidden`，通知因此佔據 flex 高度並可能被裁切。body portal 可使通知脫離這些容器限制。`UserIdentity.tsx` 已使用 body portal；全域 CSS 亦有 `position: fixed` overlay 實例。
- **Alternatives considered**: 在工作區預留通知列會持續佔用視圖高度，與使用者已選定的浮動提示不符；保留在 `.app-content` 中單純改 `position: fixed` 仍依賴祖先版面上下文，因此不採用。

## Decision: 提示外框不攔截底層指標操作

- **Decision**: 通知面板以外的覆蓋區域讓指標事件傳遞到底層工作頁；通知面板與關閉控制維持可互動。
- **Rationale**: 使用者允許通知覆蓋非操作內容，但要求底層工作操作仍可點擊。讓外框不攔截事件可同時保留固定浮動位置與工作區操作。
- **Alternatives considered**: 讓整個通知外框攔截事件會暫時禁用被覆蓋的工作區操作，與已釐清的行為衝突。

## Decision: 元件內處理關閉狀態

- **Decision**: 通知元件使用本地 UI state；使用者關閉後，React Router 切換路由期間保持關閉。
- **Rationale**: `App` 在 SPA 路由切換中維持掛載，且 bootstrap 已讀取並消耗一次性 sessionStorage 恢復標記。無須增加跨重新載入的儲存或變更認證流程。
- **Alternatives considered**: 延長保存關閉狀態到瀏覽器 reload 會引入新的持久化語意，規格未要求；自動逾時關閉與規格要求保持至使用者操作衝突。

## Decision: 沿用現有在地化及視覺驗證工具

- **Decision**: 關閉名稱加入 auth namespace 的繁體中文、英文、日文資源；以既有 SessionExpiredNotice Storybook story 檢視互動與窄畫面。
- **Rationale**: 提示已透過 auth namespace 取字串；專案已有元件 story 及 typecheck/build 驗證流程。沒有一般 test script，因此不新增測試工具。
- **Alternatives considered**: 新增翻譯 namespace 或測試框架會擴大變更範圍，對單一通知的版面修正沒有必要。
