# Data Model: Gantt 時間軸拖曳平移

本功能不新增持久化或 domain 資料。以下僅描述短暫的 UI 手勢狀態。

## Pan Gesture (ephemeral UI state)

| Field | Type | Constraint | Purpose |
|---|---|---|---|
| `pointerId` | number | 僅接受開始手勢的 pointer id | 忽略其他 pointer 的 move/up/cancel 事件 |
| `startClientX` | number | 手勢開始時的 viewport X 座標 | 計算水平拖曳位移 |
| `startScrollLeft` | number | 手勢開始時圖表 scrollLeft | 將拖曳位移轉換為容器水平位置 |
| `isDragging` | boolean | pointer up/cancel/lost capture 後為 false | 控制平移樣式及避免 click/selection 副作用 |

## Existing Gantt Data

- **Gantt timeline position**: DOM scroll container 的即時 `scrollLeft`；不保存至 URL、cookie 或後端。
- **Issue schedule**: Gitea 提供的開始日、到期日及既有異常狀態；僅既有建立/移動/調整手勢可透過原本授權流程更新。

## State Transitions

1. Eligible blank-area pointer down → capture pointer and record origin.
2. Matching pointer move → update chart `scrollLeft` from origin displacement, clamped by browser scroll bounds.
3. Pointer up, cancel, or lost capture → clear pan state and transient styles.
4. Pointer down on an excluded control or unscheduled create-range track → do not enter pan state; existing target handler owns the interaction.
