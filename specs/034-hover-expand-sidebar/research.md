# Research: Hover 展開側欄與工作檢視排序

## Findings

- `apps/web/src/components/layout/AppShell.tsx` 定義全站入口順序、sessionStorage 展開狀態及手動切換按鈕；work-view links 另套用既有 URL state builder。
- `apps/web/src/index.css` 目前用 shell state class 改變 grid 欄寬，並有一般頁面 sticky sidebar、work-view stretch sidebar、Gantt overflow clipping 與窄視窗覆寫。
- `apps/web/src/components/layout/Layout.stories.tsx` 已呈現共用 AppShell 的 repository 與 all-repositories 情境，可供本功能驗收。
- 專案已使用原生 CSS、React、React Router 和 react-i18next；無需新相依套件或外部服務。

## Decisions

### 側欄展示狀態

- **Decision**: 用 CSS hover 與 focus-within 暫時顯示文字；其餘時間固定收合，不保存狀態。
- **Rationale**: 精確符合需求，不增加 React 狀態、持久偏好或滑鼠離開計時器；鍵盤焦點仍會讓標籤可見。
- **Alternatives considered**: grid 展開並推動內容、手動 toggle/pin、sessionStorage 偏好；各自違反內容不移位或固定收合的需求。

### 覆蓋版面

- **Decision**: Grid 繼續保留目前 collapsed sidebar 的窄軌，展開視覺層以更寬的 sidebar 疊放在相鄰 app-content 上方。
- **Rationale**: 固定內容欄位位置和寬度，同時保留主要內容互動，不因 hover 改排版。
- **Alternatives considered**: 變更 app-layout track 或在內容加入 margin/padding；兩者都會讓工作控制列重排。

### 觸控與輔助科技

- **Decision**: 觸控保持圖示列並直接操作連結；用入口原有 accessible name、aria-current 和可見鍵盤焦點。
- **Rationale**: 不依賴不存在的 hover 手勢，也不另造 click-to-toggle 狀態。
- **Alternatives considered**: 點擊側欄切換展開、觸控首次點擊展開；與固定收合和直接操作的既定選擇不符。
