# Research: Gantt 今天高亮與拖曳排程

## Decision 1: 沿用現有 DOM/CSS 時間軸，不增加圖表套件

- **Decision**: 在既有 Gantt calendar header 與 issue track overlay 加入 today day-range 背景；bar 和拖曳端點由 DOM 元件呈現。
- **Rationale**: `GanttCalendarHeader.tsx` 與 `GanttIssueRow.tsx` 已依 `GanttTimelineCell[]` 定位週末、today 和 bar。日期格已支援 Day、Week、2 weeks、Month，且用日曆日期處理月長與 DST。
- **Alternatives considered**: 新增圖表或拖曳套件。此功能只需格線映射、DOM pointer interaction 和鍵盤端點，加入套件會擴大 bundle 和無障礙整合範圍。

## Decision 2: 從父層 Gantt loader 提供寫入和 refresh callback

- **Decision**: Gantt row 將使用者的新日期交給 GanttBoard；由 workspace 的 `KanbanBoard` 提供保存 callback，成功或失敗後刷新 Gantt view。
- **Rationale**: GanttBoard 收到 `issues` prop 且目前是唯讀呈現；父層已擁有 All repos/Repository Gantt 的 load 狀態與錯誤 UI。由父層刷新可避免局部 Issue snapshot 成為第二資料來源。Storybook 使用 mock callback，demo 不寫入。
- **Alternatives considered**: GanttBoard 自行發 request 並保留本地 Issue 複本。這會分裂 loader 錯誤處理並造成 Gitea 更新後 UI 來源不一致。

## Decision 3: 沿用既有排程更新契約與實際值錯誤

- **Decision**: 使用 Issue PATCH、`expectedUpdatedAt`、目前使用者 Gitea 權限與 Gantt refresh。start-date Label 保持 atomic replacement；due date 維持 Gitea 原生欄位。
- **Rationale**: `IssueEditForm.tsx` 已使用版本戳更新日期；API `updateIssue` 檢查版本、驗證權限，排程錯誤包含重新讀取的實際日期。現有排程 contract 把日期欄位定義為可選，但 validator 目前仍強制 Type/Priority，因此要允許日期-only PATCH，並在未提交 Type/Priority 時保留現有 Labels。Gitea 沒有跨 Label replacement 和 due-date PATCH 的交易。
- **Alternatives considered**: 為拖曳新增 API 或把日期快取在 Portal。兩者都會重複現有契約或違反 Gitea 作為唯一資料來源。

## Decision 4: 一日精度、單格吸附與邊界自動延展

- **Decision**: pointer 位置映射到其所在 calendar day；拖曳近水平 viewport 邊緣時自動捲動，近資料範圍末端時增加 28 calendar days。排程日期維持整日值。
- **Rationale**: 現有 Start/Due contract 僅接受 `YYYY-MM-DD`；原有 timeline helper 可把日期映射至各 scale cell。自動捲動與延展使遠日期仍能在單一拖曳中到達。
- **Alternatives considered**: 支援時間精度、使用手動水平捲動分段操作。現有領域資料沒有時間欄位，手動分段會中斷使用者已選定的連續拖曳流程。

## Decision 5: 明確呈現排程端點並保留鍵盤替代操作

- **Decision**: bar 中段移動整段，左右端點改日期；單一日期 bar 的空缺端點負責建立另一端。鍵盤以方向鍵逐日預覽、Enter 儲存、Escape 取消。
- **Rationale**: 滑鼠直接操控 bar 符合排程圖常見操作；具名稱的端點與鍵盤提交/取消可支援不使用 pointer 的使用者。
- **Alternatives considered**: 只提供 pointer drag。這會讓日期更新沒有鍵盤替代操作，與 Portal 無障礙需求衝突。
