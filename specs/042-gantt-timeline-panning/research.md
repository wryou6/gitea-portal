# Research: Gantt 時間軸拖曳平移

## Decision 1: 保留圖表原生水平捲軸

- **Decision**: 移除圖表下方自訂 range slider，以 `.gantt-chart-scroll` 的原生水平捲軸作為唯一水平捲動控制。
- **Rationale**: 目前圖表容器已承載表頭和所有 Issue 列，且 `onScroll` 已同步可見日期；range slider 只鏡像相同的 scroll position。移除鏡像控制即可避免重複操作來源。
- **Alternatives considered**: 保留自訂 slider 並隱藏原生捲軸。拒絕，因為自訂控制需要同步狀態及尺寸量測，且直接操控圖表本身更符合單一捲動容器設計。

## Decision 2: 在圖表容器處理空白格平移

- **Decision**: GanttBoard 在共用 scroll container 接收 Pointer Events，依事件起點限定於日曆 header 或時間軸 track，排除未排程建立區、bar、`data-drag-mode`、連結、按鈕與表單控制。
- **Rationale**: 排程 move/resize/create 手勢由 GanttIssueRow 的 track event handler 與 pointer capture 管理；在外層容器統一處理空白格可保留既有列內操作，並讓水平位置由唯一 scroll container 管理。
- **Alternatives considered**: 每列各自實作 pan。拒絕，因為分散的 pointer capture 會使 header、scheduled row 與 empty timeline 行為不一致，也增加手勢衝突風險。

## Decision 3: 觸控平移與既有排程手勢共存

- **Decision**: 空白日期格支援手指水平平移；允許原生垂直 pan。未排程且可建立排程的 track 維持 `touch-action: none` 和原有拖曳建立日期範圍行為。
- **Rationale**: 使用者確認觸控空白處可平移，同時未排程列仍以拖曳建立排程。依起始區域分流可讓兩種行為明確且互斥。
- **Alternatives considered**: 整個圖表統一接管 touch gesture。拒絕，因為這會攔截未排程列的建立手勢及原生垂直捲動。

## Decision 4: 用可聚焦圖表容器保留鍵盤捲動

- **Decision**: 圖表容器可由 Tab 聚焦，焦點位於容器自身時，左右方向鍵水平移動固定小步距，Home/End 移至水平兩端；子控制保留自身鍵盤操作。
- **Rationale**: 移除 range input 後仍需提供明確鍵盤路徑，不能只假設每個瀏覽器都會將原生 overflow 容器納入 Tab 順序。
- **Alternatives considered**: 只依賴原生 scrollbar 鍵盤行為。拒絕，因為其可聚焦行為依瀏覽器與平台而異。

## Codebase Evidence

- `GanttBoard.tsx` 中 scheduled 與 empty chart 都以 `.gantt-chart-scroll` 作為水平 scroll container，兩者目前各自渲染 range input；目前 `chartMaxScroll` 與 `chartScrollLeft` 僅供這些 range input 使用。
- `GanttIssueRow.tsx` 以 track pointer handlers 完成未排程日期區間建立及既有 bar move/resize，且把 pointer capture 設在 Issue track。
- `index.css` 已為未排程建立區及 bar 操作指定 `touch-action: none`，並提供原生 scrollbar 顏色與尺寸。
- `GanttBoard.stories.tsx` 已有長列表、窄版、schedule editing 及 no-schedule-date 等情境，可用來展示新增行為。
