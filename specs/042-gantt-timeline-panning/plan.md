# Implementation Plan: Gantt 時間軸拖曳平移

**Branch**: `042-gantt-timeline-panning` | **Date**: 2026-10-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/042-gantt-timeline-panning/spec.md`

## Summary

保留 Gantt 圖表本身的原生水平捲動，移除重複的自訂 range slider。讓使用者從時間軸標頭或可平移的 Issue 時間軸空白格以滑鼠、觸控筆或手指拖曳平移；未排程且支援建立排程的列、排程 bar 和其他互動控制沿用既有手勢。圖表捲動區也會可聚焦並支援方向鍵，確保移除滑桿後仍可鍵盤瀏覽。此功能不新增 API、依賴或 Issue 資料寫入路徑。

## Technical Context

**Language/Version**: TypeScript 5.8, React 19, CSS

**Primary Dependencies**: 現有 React 19、Vite 6、Storybook 8.6；不新增 runtime dependency

**Storage**: N/A；水平位置只保存在目前 DOM scroll container，不新增持久化

**Testing**: Gantt Storybook 手動滑鼠/觸控互動檢查；Web typecheck、production build、Storybook build

**Target Platform**: 桌面及窄螢幕瀏覽器，含觸控裝置

**Project Type**: pnpm monorepo，僅修改 `apps/web` 與本 feature 文件

**Performance Goals**: 拖曳移動時直接更新既有水平 scroll position；不觸發額外資料請求或逐列 React state 更新

**Constraints**: 保持原生水平捲軸為唯一水平捲動控制；保留時間軸列對齊、unscheduled 建立排程、scheduled bar move/resize、鍵盤可操作性與既有觸控垂直捲動；Gitea 仍是排程資料唯一來源

**Scale/Scope**: GanttBoard 的有排程與空時間軸兩種呈現；時間軸標頭及 Issue track；桌面滑鼠/觸控筆、觸控手指及鍵盤

## Constitution Check

| Gate | 規範 | 設計處理 | 狀態 |
|---|---|---|---|
| I | Gitea 是 Issue 資料唯一來源 | 平移只改變 DOM 水平位置，不儲存位置或建立 Issue mirror | PASS |
| II | 操作權限必須跟隨目前使用者 | 不新增 API 或 Gitea 操作 | PASS |
| III | Gitea 寫入必須保全資料並可驗證 | 保留既有未排程建立排程與 bar move/resize 寫入路徑；平移不得觸發寫入 | PASS |
| IV | 跨來源彙整不得呈現部分結果 | 不改變載入、資料彙整或錯誤處理 | PASS |
| V-VI | Status 與工作範圍語意 | 不改變 Issue 欄位、Status、Repository 或資料來源呈現 | PASS |
| VII | 使用者可見文字必須納入多語系 | 不新增可見字串；圖表延續既有 aria-label，新增焦點樣式遵循共用 token | PASS |
| Process | Spec、plan、tasks、analyze 須先於實作 | 依序完成 plan、tasks、analyze 後才進入實作 | PASS |

## Project Structure

### Documentation

```text
specs/042-gantt-timeline-panning/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

不建立 `contracts/`：此功能沒有對外 API、資料契約或跨系統介面。

### Source Code

```text
apps/web/src/features/work-views/
├── GanttBoard.tsx                 # 唯一捲動控制、平移/鍵盤事件、兩種圖表容器
└── GanttBoard.stories.tsx         # 桌面、窄版、空時間軸及排程互動展示情境

apps/web/src/index.css             # 平移游標、觸控手勢及焦點樣式；移除自訂滑桿樣式
```

**Structure Decision**: 互動狀態屬於 GanttBoard 的共同捲動容器；Issue track 仍由 GanttIssueRow 處理排程建立與 bar 操作。GanttBoard 以事件目標辨識在可平移時間軸空白格開始的手勢，避免改動 Gitea 寫入流程。

## Design Decisions

### 唯一水平捲動控制與鍵盤操作

- 移除有排程與無排程兩種 Gantt 呈現中的 `.gantt-horizontal-scrollbar` range input，以及只供 range 同步使用的 `chartMaxScroll`、`chartScrollLeft` 狀態和 slider CSS。
- 保留 `.gantt-chart-scroll` 的原生水平捲軸作為唯一水平捲動控制；既有 `onScroll` 持續更新可見日期與日曆標頭。
- 讓圖表捲動區可透過 Tab 聚焦，並在容器本身取得焦點時以左右方向鍵小幅水平捲動、Home/End 移至兩端。事件只在焦點目標為圖表容器本身時處理，不攔截其內按鈕、連結或 bar handle 的鍵盤操作；顯示共用 focus-visible 樣式。

### 指標/觸控拖曳平移

- 在 GanttBoard 共用水平捲動容器處理 Pointer Events，套用於有排程與空時間軸兩種呈現。
- 只允許從日曆標頭或 Issue 時間軸格線空白處開始平移；以 pointer id、起始 X 座標及起始 scrollLeft 記錄手勢，移動時直接將水平位移套用至同一容器，pointer up/cancel/lost capture 時清除狀態。
- 當窄螢幕的固定欄位遮住日期格時，另允許觸控手勢從 `.gantt-header-fields` 或 `.gantt-row-fields` 中的非互動空白處開始平移；此入口限手指觸控，不能攔截連結、按鈕、表單控制、Issue bar 或未排程建立區的原操作。
- 排除未排程建立區、`.gantt-bar`、`[data-drag-mode]`、連結、按鈕及表單控制。未排程且現有排程建立操作啟用時保留其 `touch-action: none`，使手指拖曳建立日期範圍；其他時間軸格線允許自訂水平平移並保留原生垂直捲動。
- 平移開始時避免文字選取並顯示 grab/grabbing 游標；捲動範圍仍由瀏覽器限制在有效邊界，不自行改變日期範圍或排程資料。

### Storybook 與品質驗收

- 新增或擴充代表性 Storybook 情境，涵蓋長時間軸空白格、未排程 Issue、bar 操作、空時間軸及窄版呈現；以滑鼠與觸控模擬檢查時間軸、固定欄位空白處及互動控制的手勢區域。
- 不增加 API、資料模型、翻譯字串或自動化測試套件；執行 Web typecheck、production build 與 Storybook build，並按 quickstart 完成人工互動驗收。

## Complexity Tracking

無 Constitution 例外。
