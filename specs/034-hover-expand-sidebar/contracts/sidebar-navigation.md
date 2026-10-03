# UI Contract: Sidebar Navigation

## Order and destination

- 顯示順序：Create issue、Kanban、Gantt、Issues/List。
- 項目標籤、圖示、登入後可見範圍、route、工作區脈絡、active 狀態及 work-view URL 傳遞沿用既有行為。

## Presentation

- 預設及 pointer/focus 離開時只顯示圖示，保留窄側欄軌道。
- 支援 hover 的指標移入或鍵盤焦點進入時顯示圖示與文字。
- 展開側欄覆蓋內容，保持 app-content/control panel/timeline 的幾何位置與寬度。
- Sidebar 不得遮蓋 topbar、裁切 focused item，或令窄 viewport 產生額外水平捲動。

## Accessibility and input

- 導覽連結保有可存取名稱、鍵盤啟動、可見 focus indicator、aria-current page 狀態。
- 觸控輸入可直接點擊收合圖示連結，不使用點擊切換 sidebar 模式。
- 不提供 manual pin/toggle，也不持久保存暫時展開狀態。

## Compatibility

- 不更動 API、路徑、工作檢視 query contract、使用者權限或 Gitea 資料行為。
- 不新增使用者可見文案；沿用既有繁中、英文、日文 i18n labels。
