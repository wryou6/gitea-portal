# Quickstart: Gantt 時間軸拖曳平移

## Prerequisites

- 可開啟 Gantt Storybook 或已登入的 Portal Gantt。
- 使用含有 scheduled、unscheduled、bar-editable 與 no-schedule-date 情境的 Storybook fixtures。

## Validation Scenarios

1. **單一水平捲軸**：桌面寬視窗開啟長時間軸；確認只保留圖表原生水平捲軸，range slider 不再顯示。
2. **滑鼠平移與日期對齊**：在日曆 header 及 scheduled row 的空白格按住左鍵左右拖曳；確認圖表水平移動、日期標頭和列保持對齊，且到達兩端時不越界。
3. **互動區隔離**：拖曳 Issue bar 本體、move 區與 resize handle；確認原本的排程操作仍執行。點擊/拖曳欄位連結與按鈕時，確認不觸發 pan。
4. **未排程列手勢**：在可建立排程的 unscheduled row 空白格拖曳日期範圍；確認預覽與原有儲存流程照常，且該手勢不平移圖表。
5. **觸控平移**：以窄版觸控裝置或 Storybook touch emulation 在 header/scheduled 空白格水平拖曳，確認平移；在 unscheduled create-range track 拖曳，確認仍建立區間。垂直手勢仍能捲動列。
6. **鍵盤平移**：Tab 聚焦圖表容器；使用左右方向鍵移動時間軸，使用 Home/End 到達兩端。確認容器內連結、按鈕及 bar handle 的鍵盤操作不被攔截，焦點外框清晰可見。
7. **空時間軸**：使用無 scheduled issues 但有 unscheduled/anomalous rows 的情境，確認同一個原生水平 scroll container 可平移，且不出現第二個控制。
8. **窄版與主題**：在窄視窗的淺色及深色主題確認 grab/grabbing、focus-visible、原生捲軸、sticky header/fields 與垂直捲動都可辨認。

## Project Checks

- `pnpm.cmd --filter @gitea-portal/web typecheck`
- `pnpm.cmd --filter @gitea-portal/web build`
- `pnpm.cmd --filter @gitea-portal/web build-storybook`

Storybook/build 驗證不等同於瀏覽器手勢驗收；完成後需記錄上述滑鼠、觸控與鍵盤情境的實際觀察結果。

## Verification Results (2026-10-12)

- **Web typecheck**: `pnpm.cmd --filter @gitea-portal/web typecheck` passed.
- **Production build**: `pnpm.cmd --filter @gitea-portal/web build` passed; Vite reported the existing large-chunk warning.
- **Storybook build**: `pnpm.cmd --filter @gitea-portal/web build-storybook` passed; Storybook reported its eval and large-chunk warnings.
- **Story catalog smoke check**: local Storybook `index.json` returned HTTP 200 and listed `TimelinePanning`, `UnscheduledOnlyTimeline`, `ScheduledMonthTimeline`, `UnscheduledOnlyMonthTimeline`, and `TimelinePanningNarrow`.
- **Source review**: no `.gantt-horizontal-scrollbar` input/style or slider-only state remains; pan handlers only change the chart `scrollLeft`. Existing unscheduled create-range and bar drag/resize handlers remain in `GanttIssueRow.tsx`, and their `touch-action: none` styles remain.
- **瀏覽器手勢驗收**：使用暫存安裝的 Playwright 1.64.0 與 Chromium 156.0.8078.4，操作本機 Storybook preview；未新增專案相依套件。
- **單一捲軸與滑鼠**：有溢出的情境只有一個 `.gantt-chart-scroll`，沒有自訂 range slider；在日期標頭與 scheduled 空白列拖曳後，`scrollLeft` 分別前進 120px 與 100px。拖曳 bar 本體及 Issue 標題連結時，圖表位置不變。
- **鍵盤**：方向鍵可移動時間軸，End 到達瀏覽器實際捲動邊界，Home 回到 0；聚焦 bar handle 後按方向鍵不會攔截成圖表平移。焦點外框為 2px solid。
- **觸控**：在空白日期標頭水平拖曳後，`scrollLeft` 前進 120px；在 640px 窄版 preview 拖曳後前進 100px。由空白標頭作垂直手勢後，圖表 `scrollTop` 前進 95px，保留原生列垂直捲動。
- **未排程建立手勢**：以滑鼠及觸控拖曳 create-range track 時，日期範圍預覽均出現，圖表 `scrollLeft` 保持 250px；Storybook fixture 的儲存 callback 為 no-op，放開後暫存預覽消失。此結果驗證手勢隔離與預覽，不代表 Gitea 寫入驗收。
- **空時間軸與樣式**：沒有 scheduled issues 的情境仍使用單一 `.gantt-chart-scroll--empty`，日期標頭拖曳可平移 100px。640px 窄版淺色/深色主題 tokens 有變化；`grab`/`grabbing`、原生 thin scrollbar、sticky header/fields 與焦點外框均可由瀏覽器 computed style 確認。
- **驗收方式備註**：Storybook manager 的 `mobile1` viewport 將此 fixture 的圖表縮至 36px 寬且高度為 0，故窄版手勢改在直接 preview 頁設定 640×844 viewport 驗收；在此尺寸下圖表為 504×550px 且可觸控平移。
- **390px 固定欄位觸控驗收**：在 `TimelinePanningNarrow` preview 設為 390×844，固定欄位覆蓋整個圖表可視寬度；從非互動的 Repository 欄位空白處往左拖曳，`scrollLeft` 由 0 增至 100px。標題連結及欄位排序按鈕的觸控拖曳都未改變 `scrollLeft`。
- **390px 垂直觸控與列建立隔離**：從固定欄位作垂直手勢，`scrollTop` 增至 93px，`scrollLeft` 不變。未排程列在可見的 create-range track 上以觸控拖曳仍出現日期預覽，且不平移圖表；Playwright 全程沒有 page error。
