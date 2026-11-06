# Data Model: Hover 展開側欄與工作檢視排序

本功能不新增持久資料、API 欄位或 domain entity。

## Sidebar presentation state

- **性質**：由目前輸入狀態衍生的暫時 UI 呈現狀態。
- **Expanded when**：游標位於側欄內（僅支援 hover 的指標）或鍵盤焦點位於側欄內。
- **Collapsed when**：上述狀態皆不成立，包括初始 render、導覽完成及重新載入後。
- **Persistence**：不寫入 sessionStorage、localStorage、伺服器偏好或 URL。

## Navigation item

沿用 AppShell 現有項目：Create issue、Issues/List、Kanban、Gantt。入口具有既有 route、i18n label/icon 及 active page 狀態；只變更排序與呈現方式，不變更識別及目的地。

## Relationships

- 導覽項目順序為 Create issue → Kanban → Gantt → Issues/List。
- 暫時展開狀態屬於整個 sidebar，不影響入口 route、工作區、篩選、URL 或 Issue 資料。
