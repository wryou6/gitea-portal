# Research: 三個工作檢視的 Issue 浮窗

## Decision 1: 使用 React Router 8 Link mask

**Decision**: Issue key／標題連結以目前工作檢視 URL 作為 Router destination，並以既有 Issue detail URL（含 `returnTo`）作為 mask。`App` 在應用程式已啟動後收到 masked navigation 時顯示 Issue 浮窗；首次載入若 location 帶 mask，則顯示完整 Issue 頁面。

**Rationale**: Repository 使用 `react-router` 8.4.0，已支援穩定的 `Link.mask`。此模式讓 Router location 保持來源工作檢視，來源元件、URL 狀態及暫態捲動狀態維持掛載，同時讓瀏覽器網址直接代表 Issue。React Router 文件明確指出 mask 用於保留底層情境並顯示另一個網址；分享或新分頁只會載入 mask URL，符合本功能的完整頁面 fallback。首次 render 時不呈現浮窗也可確保 refresh 不誤顯 modal。

**Runtime Compatibility**: Although `Link.mask` typechecks with Declarative `BrowserRouter`, React Router 8.4 only forwards the mask option in Data/Framework modes. The application entrypoint now uses `createBrowserRouter` and `RouterProvider`; this makes clicks retain the source work-view location while the address bar shows the masked Issue URL.

**Alternatives considered**:
- 將 Issue URL 作為 Router location 並自行保留 `backgroundLocation`：會使現有 view hooks 讀到 Issue URL，需額外維護背景 location context，且易與 List/Gantt URL state 分歧。
- 不更新網址，只以 React state 開啟對話框：不符合 Issue URL 必須代表目前 Issue 的需求，也無法支援瀏覽器返回關閉。

**Sources**: [React Router Link `mask`](https://reactrouter.com/api/components/Link), [React Router `useNavigationType`](https://reactrouter.com/api/hooks/useNavigationType).

## Decision 2: Initial masked load renders the full Issue page

**Decision**: 對 `App` 初始 render 中恢復的 `location.mask`，將 mask path/search 作為完整 Issue route；只在應用程式掛載後的新 masked navigation 顯示浮窗。從浮窗展開時 replace 成無 mask 的 Issue route。

**Rationale**: React Router 把 mask 狀態保存於瀏覽器 history，重新整理可能還原 masked location。功能規格要求 reload 顯示完整頁面，因此不能只以 `location.mask` 判斷浮窗。以應用程式首次 render 與後續 route navigation 區分即可避免額外的持久狀態或 query flag。

**Alternatives considered**:
- 依 `location.mask` 永遠顯示浮窗：會在重新整理後錯誤保留浮窗。
- 在 Issue URL 加入 `modal=true`：讓分享網址包含呈現旗標，且必須增加 URL 清理及直接載入例外規則。

## Decision 3: Reuse complete Issue detail behavior

**Decision**: 將現有 `IssueDetailPage` 的詳情資料與操作內容重用於完整頁及浮窗，只讓 presentation/header/navigation 不同；查詢、留言、編輯與狀態轉換維持相同 API 和權限路徑。

**Rationale**: 現有完整詳情已同時載入 Issue 與 Comments，並提供既有錯誤、重試、編輯、留言及 Status transition 行為。共用內容避免浮窗形成不完整或權限不同的第二套 Issue UI。

**Alternatives considered**:
- 新建摘要預覽及另一份資料載入流程：與已選擇的完整詳情範圍重複，增加 UI 與資料狀態分歧。
