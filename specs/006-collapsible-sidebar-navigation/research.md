# Research: 可收合側邊導覽

## Decision 1: 在既有全站 AppShell 放置導覽

**Decision**: 將頂部品牌列、側欄與主要內容組成共用 shell，放在 `apps/web/src/components/layout/AppShell.tsx`；全站尺寸與斷點由 `apps/web/src/index.css` 負責。

**Rationale**: `App.tsx` 已將 Issue 清單、新增/詳情、Board 清單、Kanban 和 Gantt 都包在同一個 `AppShell`。單一導覽入口能讓所有頁面保持一致，且不碰 Issue 或 Board 頁面資料流程。

**Alternatives considered**:
- 每個頁面自行加入導覽：會複製狀態與連結，容易造成不同頁面導覽不一致。
- 引入新的 layout/router 套件：目前只有少量靜態入口，新增相依與路由遷移沒有必要。

## Decision 2: 以既有 Board URL 表達目前 Board，以 query 保留選擇意圖

**Decision**: Issue 清單、新增與詳情使用 `/issues`、`/issues/new`、`/issues/<owner>/<repo>/<number>`。有 Board 路徑脈絡時，Kanban/Gantt 導覽直接指向相同 Board 的 `/boards/<id>/kanban` 或 `/boards/<id>/gantt`。沒有 Board 脈絡時，導向 `/kanban` 或 `/gantt`；Board 選擇頁依入口路徑保留 view intent，並將選定 Board 開在對應檢視。`/boards` 維持 Board Settings/管理用途。根路徑、單數 `/issue/...` 與 `/boards?view=...` 保留為舊網址相容入口。

**Rationale**: Board ID 已存在於現行 URL，不需另存全域 Board 選擇或建立新資料。query 只代表本次導覽目的，能在 Board 清單中保留使用者點選的檢視種類。

**Alternatives considered**:
- 讓 Kanban/Gantt 永遠連到 `/boards` 而不保留入口路徑：會遺失目標檢視種類，使用者還要再選一次。
- 在偏好資料中保存全域目前 Board：新增不必要的使用者狀態持久化，也無法直接重現可分享的 Board URL。
- 新增獨立 Board picker 頁：與現有 Board 清單重複。

## Decision 3: 側欄偏好限目前工作階段

**Decision**: 以瀏覽器工作階段範圍保存展開/收合狀態；預設展開。頁面導覽或重新載入後維持，新的工作階段重新展開。

**Rationale**: 原生 `<a>` 會重新載入頁面，單靠元件記憶體狀態無法滿足規格。工作階段範圍保存正好符合使用者選擇，且不會變成跨工作階段或伺服器端的偏好資料。

**Alternatives considered**:
- 只存元件狀態：頁面導覽後會重設，違反 FR-014。
- 跨工作階段記住：使用者已選擇只保留目前工作階段。
- 伺服器端保存偏好：增加 API 和持久化資料，超出功能範圍。

## Decision 4: 使用現有 React/CSS 與內嵌 SVG

**Decision**: 使用 React 19、TypeScript、現有全域 CSS 和簡單內嵌 SVG；不新增圖示或路由套件。窄視窗採頁面版面中的可收合側欄，不使用覆蓋內容的浮層。

**Rationale**: 專案目前已使用手寫路徑判斷、Tailwind CSS v4 與全域 `:focus-visible` 樣式，沒有 icon 套件。四個固定圖示可由內嵌 SVG 提供；側欄以版面欄位推移內容，符合不得遮擋頁面的需求。

**Alternatives considered**:
- 新增 icon 套件：只有四個簡單圖示，依賴成本高於效益。
- 在窄視窗使用 overlay drawer：與主要內容不得被側欄遮擋的驗收條件不符。

## Findings

- 全站 shell：`apps/web/src/components/layout/AppShell.tsx`
- canonical routes、舊網址相容及手寫 route resolver：`apps/web/src/app/routes.ts`、`apps/web/src/app/App.tsx`
- Board 清單/編輯及 Board view 連結：`apps/web/src/features/boards/BoardListPage.tsx`
- 全域版面與 720px 斷點：`apps/web/src/index.css`
- Web 使用 React 19、TypeScript 5.8、Vite 6、Tailwind CSS 4；沒有 router 或 icon dependency。
