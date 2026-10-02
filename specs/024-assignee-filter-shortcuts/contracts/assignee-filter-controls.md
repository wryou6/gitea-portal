# UI Contract: 負責人快速篩選

## Shared Filter Bar

適用於 All repos 與 Repository workspace 的 Issues List、Kanban、Gantt。使用共用負責人欄位，不新增網路 API 或資料寫入操作。

| Control | Behavior |
|---|---|
| Priority / Type / Status | Each filter is a mutually exclusive group of directly clickable buttons, includes an all option, updates only its own filter value, and exposes its selected state with `aria-pressed` |
| Assignee selector | 原生 select 直接列出候選人；已選一位負責人時仍可展開並改選其他人；`all` 和 `me` 由快捷按鈕顯示，不輸出 `assignee=all` |
| 自己 button | 設定篩選狀態 `me`，網址為 `assignee=me`，依目前登入者更新結果；其他篩選保留 |
| 所有負責人 button | 設定內部狀態 `all`，移除 URL 的 assignee 參數；其他篩選保留 |
| Clear filters | 將負責人重設為 `me`、其餘條件重設為預設；負責人為 `me` 或 `all` 且無其他有效條件時停用；fixed Repository 維持由工作區提供 |

## Accessibility and Localization

- 兩個快速操作都是一般可聚焦 button，可用 Enter/Space 啟用。
- 優先級、類型、狀態選項都是一般可聚焦 button，以 `aria-pressed`（或等效可及狀態）標示每組目前選擇；鍵盤 Tab 順序依視覺順序排列。
- 快捷按鈕置於指定 login select 之前，按鈕與選單依視覺順序排列；狹窄面板可換行且不得水平捲動。
- 以 `aria-pressed` 或等效可及狀態標示目前選擇，並保留可見 focus。
- 新增的 button label 及需要的 aria label 使用 i18n，支援 `zh-TW`、`en`、`ja`。
- Storybook fixture 提供目前登入者 login，避免示範故事依賴 API。

## URL Contract

缺少 assignee 條件解析為 all；`assignee=me` 解析為目前登入者；實際 login 解析為固定負責人。Portal 預設檢視連結帶 `assignee=me`；所有負責人由移除 assignee 參數表示。其他條件依現有共用 URL contract 保留。
