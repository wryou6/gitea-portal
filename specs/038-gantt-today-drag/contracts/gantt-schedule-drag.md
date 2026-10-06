# Gantt 排程拖曳 UI Contract

## Scope

適用於 All repos 與 Repository Gantt 的 `scheduled`、`unscheduled` rows。`invalid` date anomaly rows 不提供日期拖曳。Gitea Issue API contract 不變。

## Pointer behavior

- Scheduled range: 拖曳左端只調整 Start，右端只調整 Due；拖曳 bar 中段等距平移已存在的日期欄位。
- Start-only row: 左端調整 Start，右端建立 Due；中段只平移 Start。
- Due-only row: 左端建立 Start，右端調整 Due；中段只平移 Due。
- Unscheduled row: 按住並拖出日期範圍，保存含首尾日期的 Start/Due。
- 日期吸附到 pointer 所在的 calendar day；dragging 未離開日期格不會寫入。端點不會跨越另一端。
- 接近 viewport 水平邊緣時自動水平捲動；接近 timeline data edge 時延展日期範圍，拖曳日期連續。
- Pointer release 提交一次；操作前顯示預覽，取消不寫入。Gantt `demo`/Storybook 永不呼叫真實 Gitea。

## Keyboard behavior

- Start/Due handles 可由 Tab 聚焦；方向鍵逐日改變預覽日期。
- Enter 提交目前預覽，Escape 還原拖曳前日期。
- 螢幕閱讀器可取得 Issue、端點欄位、目前日期以及保存/錯誤狀態。

## Persistence and failure

- 使用既有 `PATCH /api/issues/{owner}/{repo}/{number}` 更新；包含 `expectedUpdatedAt`，只提交本次異動的日期欄位。Range move/create 同時提交 Start 與 Due。
- 日期-only PATCH 不要求 Type/Priority；未提供的 Type、Priority、一般 Labels 與 Status Labels 必須保留原值。此功能不新增 route 或日期欄位。
- 寫入仍依目前使用者 Gitea 權限；Portal 不代理較高權限身份。
- PATCH 成功後由目前 Gantt loader 刷新；衝突或其他寫入失敗亦刷新實際排程並顯示錯誤。
- Gitea 不保證跨 Start Label 與 Due 欄位的交易原子性。若部分保存，UI 顯示重新讀取的實際日期，不假設回滾。

## Visual and localization

- Today 以一日寬淡 primary tint 出現在 header 和所有 row；today 日期標頭使用強調樣式。
- 色階適用兩種 theme；today 覆蓋 weekend tint，schedule bar 顯示在 today tint 上方。
- 所有新控制、live announcement 和錯誤文字支援 zh-TW/en/ja，並提供鍵盤可見 focus。
