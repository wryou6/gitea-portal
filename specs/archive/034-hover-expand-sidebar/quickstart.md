# Quickstart: Hover 展開側欄與工作檢視排序

## Prerequisites

- 在 repo root 安裝既有 pnpm workspace dependencies。
- 使用本機 Portal 或 Storybook shell 驗收共用 AppShell。

## Static validation

```powershell
pnpm.cmd typecheck
pnpm.cmd build
```

預期：兩項指令成功，且不需新增套件或 API。

## UI scenarios

1. 開啟 Layout / Portal shell story，確認導覽為 Create issue、Kanban、Gantt、Issues/List。
2. 在未懸停且焦點位於內容時確認側欄窄版；移入側欄確認標籤疊在內容上，控制列與內容邊界不移動；移出後側欄收合。
3. 用鍵盤 Tab 進入每個入口，確認側欄在 focus-within 時展示標籤、焦點清晰且連結可啟動；Tab 離開後收合。
4. 在 viewport 寬度 375px、768px、1280px 驗收一般頁面與工作檢視；展開不能推開控制列、裁切側欄或造成頁面水平溢出。
5. 在 Gantt 全高版面確認 overlay 不被 app-layout overflow 裁切，也不覆蓋 topbar；時間軸和固定欄寬不改變。
6. 以觸控輸入點擊收合的 Kanban、Gantt 與 List 圖示，確認直接導覽成功且沒有依賴 click-to-expand。
7. 在繁中、英文、日文確認入口名稱沿用翻譯；切換工作檢視後驗收原有 repository context、filters、Gantt state 及 List sort 傳遞規則。
