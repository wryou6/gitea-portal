# Research: Gantt 表格與日曆時間軸

## Decision 1: 保留 semantic DOM/CSS 日曆，不新增圖表套件

- **Decision**: 使用語意化表格列搭配 DOM/CSS 日期軸與排程 bar。
- **Rationale**: 現有 Gantt 已以 React/CSS 呈現有效日期區間、單日項目及日期異常；新增需求集中於欄位與日期刻度，不需要 Canvas。語意列可保留標題連結、表頭、鍵盤操作與窄版水平捲動。
- **Alternatives considered**: Chart.js 或其他 Canvas chart。它們會增加對齊、輔助科技、左右欄固定及可自訂欄位的整合成本，且無此功能需要的資料分析能力。

## Decision 2: Gantt 欄位偏好獨立於 Issues table

- **Decision**: 使用 Gantt 專用、login-keyed、版本化 cookie，保留 visibility 與 column order；日期欄不納入 Gantt column set。
- **Rationale**: 預設欄與日期資訊位置不同，若共用偏好會讓一種檢視的操作覆寫另一種檢視。既有 Issues helper 已建立登入名稱隔離、一年期保存、壞值回預設的慣例，可複用行為而不耦合資料。
- **Alternatives considered**: 共用現有 Issues cookie；不同檢視的固定欄與日期呈現需求不同，會產生相互覆蓋或無效欄位。

## Decision 3: 日期時間軸完整涵蓋有效排程，起始日只定位初始 viewport

- **Decision**: 圖表可向前及向後瀏覽所有有效 schedule date；URL 起始日只決定初次定位，不裁切更早 bars。日期偏移以 calendar-day ordinal 計算；today 取瀏覽器本地日期。
- **Rationale**: 保留整體排程完整性，符合使用者指定的可回看日期語意。日曆日期不是時間戳；以 elapsed milliseconds 受夏令時間影響。
- **Alternatives considered**: 把選定日期當硬性左界；會隱藏起始日前已存在的排程，違反完整時間軸需求。

## Decision 4: Scale 對應日曆格，保留 Issue 日期精度

- **Decision**: Day 是日格、Week 是週一開始的週格、2 weeks 是以起始日為錨的十四日格、Month 是日曆月格。Header 顯示月份與日/週期範圍；週末背景以真實日期計算。
- **Rationale**: 使用者選項代表不同時間單位；保留 exact issue date mapping，只有刻度密度改變。可在粗尺度保留週末/今天方向提示。
- **Alternatives considered**: 只稀疏日期文字但維持固定單日寬度；這不會提供使用者所選的週、雙週或月尺度。

## Decision 5: URL state contract is client-side only

- **Decision**: `gantt_start` 與 `gantt_scale` 加入現有 Gantt URL state，沿用 `history.replaceState` 並在 Issue detail returnTo 中保留；不新增 API contract。
- **Rationale**: 使用者要求 reload/share 還原，現有 Gantt filters 已以 query parameters 表示。欄位偏好仍依帳號存 cookie，不放入 URL。
- **Alternatives considered**: 只在 component state 保留；重新載入及分享會遺失使用者指定的時間軸狀態。
