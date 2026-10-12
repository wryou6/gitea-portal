# Issue Detail Navigation Contract

## Entry links

- **來源**：Issue List、Kanban、Gantt 中現有的 Issue key／標題連結。
- **Router destination**：連結啟動當下的工作檢視 pathname/search，保留該 view 的有效 URL state。
- **Address mask**：既有 Issue detail URL，並以 `routePaths.issueDetailFrom` 建立經 `safeReturnTo` 可驗證的 `returnTo`。
- **Pointer/keyboard behavior**：連結保有原生 anchor semantics；modified click、新分頁及非主要按鍵操作不開啟目前分頁浮窗。卡片、row、Gantt track/bar/handles 不新增 click handler。

## Presentation rules

- 新的 masked navigation 在目前應用程式 session 中顯示 Issue detail dialog；底層仍由 Router destination 指定來源工作檢視。
- App initial render 時，若位置已帶 mask，使用 mask pathname/search 顯示 Issue 完整頁面，不呈現對話框。
- 直接 Issue URL 沒有來源 mask 時，顯示既有完整頁面。

## Dialog controls

- **Close / Escape / backdrop**：返回 modal history entry 前的來源位置。
- **Expand to full page**：將目前 entry replace 為 mask pathname/search 作為實際 location，清除 mask；Back 返回來源檢視。
- **Content**：與完整頁共用 Issue 與 Comments 查詢、載入／錯誤回饋、編輯、留言及 Status transition。
- **Nested Status dialog**：鍵盤 Escape 與焦點限制只由最上層對話框處理；關閉 Status dialog 不得同時關閉 Issue detail 浮窗。

## Persistence and authorization

- 不增加 API、Portal persistence 或 Gitea 權限路徑。
- Issue 與 Comments 仍由既有 API 以目前使用者 delegated authorization 即時載入及寫入。
- Mask 與返回目標只存在 browser history navigation state/URL；返回目標仍須通過既有 `safeReturnTo` 和 view query sanitizer。
