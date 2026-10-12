# Data Model: Issue detail dialog

本功能不新增 Gitea 或 Portal 持久資料。下列狀態只描述前端導覽與呈現。

## Router location

- **active location**：目前 Router 所使用的 pathname、search、history key；浮窗開啟時仍是來源工作檢視 URL。
- **masked Issue path**：浮窗開啟時瀏覽器地址列顯示的 Issue detail pathname/search；包含安全驗證後的來源 `returnTo`。
- **presentation**：`initial-load` 顯示完整頁面；應用程式運作期間由工作檢視連結發起的 masked navigation 顯示浮窗；展開後以無 mask 的 Issue location 顯示完整頁面。

## Relationships and lifecycle

1. Issue List、Kanban 或 Gantt 的 Issue key／標題連結建立 history entry：active location 保持來源 view，masked path 指向該 Issue。
2. 浮窗透過 masked Issue path 的 owner/repository/number 載入 Gitea Issue 與 Comments；不將資料複製或保存於 Portal。
3. 關閉浮窗回到前一個 history entry，恢復來源工作檢視及其原有元件狀態。
4. 展開浮窗時以 replace 將目前 entry 改為 masked Issue path 作為 active Issue path，清除 mask；瀏覽器返回仍回到來源工作檢視。
5. 初始載入帶 mask 的 history entry 時，mask path 直接成為完整 Issue 頁面的 route；`returnTo` 經現有安全驗證後提供頁面返回目的地。
