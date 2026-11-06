# Research: Kanban 欄位與卡片版面調整

## Decision: Desktop 欄位依可見數量平分寬度

- **Decision**: 使用現有 Kanban board grid 的等分隱式欄軌，三個 Status 欄或含 Anomaly 的四欄都使用完整容器寬度；沿用 720px 以下單欄與 lane picker。
- **Rationale**: 固定 17–21rem 欄軌造成使用者回報的右側留白。等分欄軌可共用同一份 view data，無須改 API 或手動計算欄數。
- **Alternatives considered**: 保持固定欄寬置中；只伸展三個 Status 欄而將 Anomaly 置於水平捲動區。前者仍留下寬螢幕空間，後者會讓異常欄難以和一般 Status 一起比較。

## Decision: 以三行主資訊呈現卡片並重用現有 presenters

- **Decision**: KanbanCard 顯示 Type、Priority、標題、下一步、`owner/name #number`、負責人與 Due date；不顯示沒有卡片欄位用途的通用 Labels。Repair/schedule anomaly 註記保留在主資訊後。Date 顯示沿用 `ScheduleDates` 的格式化、未設定與異常判斷，只在 Kanban 使用 due-only 呈現。
- **Rationale**: 可沿用共同的 Type/Priority 語意、日期格式及 Gitea 來源，不會在 Kanban 重造一份 date/label resolver；其他 Gantt 與 Issue detail 仍保留起訖日呈現。
- **Alternatives considered**: 在 Kanban 內自行格式化日期；重用完整 Start/Due 區塊。前者會分裂格式與異常處理，後者會額外顯示未要求的 Start date。

## Decision: 以精簡的原生 disclosure 取代 Status select

- **Decision**: 卡片以可鍵盤觸發的 disclosure 按鈕展開各目的 Status 動作；選取後呼叫既有 `onMove`，由 KanbanBoard 開啟既有 StatusTransitionDialog。對話框依目前轉換提供原因和適用的負責人選項，只有確認後才呼叫 Gitea transition。目的選項翻譯沿用共用 Status key。Anomaly 欄不傳入可移動目的地，因此不呈現此控制。
- **Rationale**: 符合使用者選定的精簡按鈕選單，也保留目前原因／負責人流程、Gitea atomic write、樂觀並行與錯誤處理。使用原生 disclosure 不新增依賴。
- **Alternatives considered**: 保留 select；直接由卡片選單送出 Gitea 更新；新增第三方 menu library。select 未符合需求，直接寫入會繞過既有轉換確認流程，新依賴沒有必要。

## Decision: Storybook 作為可視設計與狀態檢查面

- **Decision**: 擴充既有 Kanban card/board stories，使用虛構 fixtures 覆蓋完整與缺漏資料、狀態 disclosure、repair/schedule anomaly、三欄、四欄與長 Repository key；在 Storybook 檢視 light/dark、窄視窗，以及 zh-TW/en/ja 翻譯長度。Storybook 驗證選單操作；另以兩筆本機 disposable Issue 分別驗收鍵盤選單和拖曳：兩種方式都先開既有確認對話框，確認前不寫入 Gitea。若目前預覽沒有語系選擇器，為 Storybook toolbar 加一個 locale global，不影響 Portal 執行期。
- **Rationale**: 現有 `.storybook/preview.tsx` 已提供 I18nextProvider 與 light/dark theme toolbar；Storybook 有 build 指令且為本專案既有 review 面。語系切換能驗證三行版面在不同文字長度下仍可辨識。
- **Alternatives considered**: 只用靜態預覽；在 Production view 加設計專用 UI。靜態單語無法檢視所有長度，執行期不應加入 Storybook 專用工具。

## Decision: 欄內依工作狀態排序

- **Decision**: Todo、In Progress、Anomaly 依 Priority（critical → high → medium → low → 缺少／衝突）、有效 Due date 由近到遠、`updatedAt` 由舊到新排序；Done 依 `updatedAt` 由新到舊排序。相同值以 Repository owner/name/Issue number 穩定排序。
- **Rationale**: 活躍工作先呈現高優先級與近到期項目，久未更新的工作不會被新活動推到欄底；Done 欄則維持最近完成項目在前。現有資料沒有獨立完成時間，因此 `updatedAt` 是完成時間的近似值。
- **Alternatives considered**: 所有欄位最近更新優先；會讓卡片因活動頻繁跳動並使停滯工作沉底。依建立時間排序則無法優先凸顯緊急或近到期工作。
