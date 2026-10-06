# Feature Specification: Gantt 今天高亮與拖曳排程

**Feature Branch**: `038-gantt-today-drag`

**Created**: 2026-10-07

**Status**: Draft

**Input**: User description: Gantt 的今天標示改為整天醒目底色；使用者可在時間軸直接拖曳調整 Start date 與 Due date。已確認採用淡底加強標頭、拖曳端點調整日期及拖曳 bar 中段平移排程；未排程 Issue 可拖曳建立區間，單日排程可平移或補上另一端。

## Clarifications

### Session 2026-10-07

- Q: 當使用者把排程拖到時間軸最右端時，Gantt 應如何處理超出目前日期範圍的日期？ → A: 拖曳接近時間軸邊緣時自動延伸日期範圍，讓使用者繼續拖曳。
- Q: 日期異常的 Issue 是否也要能在 Gantt 拖曳修正？ → A: 異常列不提供拖曳；使用 Issue 編輯表單修正日期。
- Q: Gitea 的 Start date Label 和 Due date 分開寫入，若第二次寫入失敗可能只保存一端；這次拖曳功能要如何界定？ → A: 先另行修訂憲章，再保留完整拖曳；接受兩欄分開寫入，失敗時重新讀取 Gitea 實際值。
- Q: 哪一筆 Gitea Issue 可用於排程寫入驗收？ → A: 驗收環境中的所有 Issue 都是假資料，可任選一筆測試。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 快速辨識今天 (Priority: P1)

工程師查看 All repos 或 Repository Gantt 時，能透過整日底色與日期標頭快速定位今天，並同時看清週末和 Issue 排程。

**Why this priority**: 今天是排程判讀的關鍵參考點；細線容易在密集的時間軸中被忽略。

**Independent Test**: 在四種時間刻度中顯示包含今天的時間軸，確認日期標頭與每個排程列都高亮同一天，且 Issue bar 仍可辨識。

**Acceptance Scenarios**:

1. **Given** 今天位於可見時間軸範圍內，**When** 使用者查看 Gantt，**Then** 日期標頭與每個 Issue 時間軸列都以淡色底標示今天整日，標頭另以醒目樣式標記今天。
2. **Given** 使用者切換 Day、Week、2 weeks 或 Month 刻度，**When** 今天位於時間軸內，**Then** 高亮仍精確涵蓋今天的日期範圍，而非整個週、雙週或月份格。
3. **Given** 今天同時是週末或有排程 bar 經過，**When** 使用者查看時間軸，**Then** 今天、週末與排程仍能彼此區分。
4. **Given** 今天不在時間軸範圍內，**When** 使用者查看 Gantt，**Then** 不顯示今天高亮。

---

### User Story 2 - 直接拖曳調整排程 (Priority: P1)

工程師可直接在時間軸調整 Issue 排程，不必先開啟 Issue 表單再修改日期。

**Why this priority**: 直接操作 bar 能縮短常見排程調整流程，也能在同一時間軸上即時比較日期變化。

**Independent Test**: 在 Gantt 拖曳已排程 bar 的兩端、中段、單日 bar，以及未排程列；確認日期預覽、儲存結果與失敗恢復行為符合預期。

**Acceptance Scenarios**:

1. **Given** Issue 有 Start 與 Due，**When** 使用者拖曳 bar 左端或右端，**Then** 分別只調整 Start 或 Due；拖曳 bar 中段則等距移動整段排程。
2. **Given** Issue 只有一個排程日期，**When** 使用者拖曳 bar 中段或端點，**Then** 中段移動原有日期，端點操作可建立缺少的另一日期。
3. **Given** Issue 尚未排程，**When** 使用者在該列時間軸拖曳一段範圍，**Then** 以拖曳起訖日建立含首尾日期的排程區間。
4. **Given** 使用者正在拖曳日期，**When** 游標移動於時間軸，**Then** Gantt 顯示暫存排程預覽；放開游標後才儲存一次，取消拖曳不會變更排程。
5. **Given** 使用者沒有修改該 Issue 的 Gitea 權限、資料版本已變更或寫入失敗，**When** 儲存拖曳結果，**Then** 顯示錯誤並呈現 Gitea 實際排程，不將未保存預覽當作成功資料。
6. **Given** 使用者以鍵盤或輔助科技操作排程，**When** 選取日期端點及調整日期，**Then** 可辨識控制項名稱、目前日期及操作結果。
7. **Given** 使用者拖曳排程接近時間軸邊緣，**When** 日期超出目前時間軸範圍，**Then** 時間軸自動延伸並允許繼續拖曳。
8. **Given** Issue 缺少有效 Type 或 Priority，**When** 使用者只調整日期，**Then** 排程仍可保存，且其他 Issue Labels 與欄位不變。

## Edge Cases

- 拖曳日期端點不得產生 Start 晚於 Due 的排程；端點移至另一端時限制在有效日期範圍。
- 若拖曳開始後 Issue 已被其他使用者修改，保存須遵守既有版本檢查；衝突時重新顯示實際排程與錯誤。
- 排程儲存失敗時，包含 Start 與 Due 的排程須以重新讀取的 Gitea 實際值呈現；不得保留暫存值作為已保存值。
- Gitea 的 Start date Label 與 Due date 分開寫入；整段平移或建立未排程區間若只成功寫入一端，重新讀取後顯示兩端實際值，不自動回滾或保留未保存預覽。
- 日期異常 Issue 不提供時間軸拖曳修正，使用者沿用既有 Issue 編輯流程處理。
- 今天標記與週末底色重疊時，今天底色優先；排程 bar 仍顯示於底色上方。
- 日期對齊須以使用者當地日曆日判定，避免跨時區或夏令時間造成偏移。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Gantt MUST 在 All repos 與 Repository 工作區中，於時間軸標頭及各 Issue 列醒目標示今天的完整日期範圍。
- **FR-002**: 今天標示 MUST 在 Day、Week、2 weeks、Month 刻度中定位於同一日；日期標頭須額外醒目標示今天。
- **FR-003**: 今天標示 MUST 與週末底色及排程 bar 同時存在時保持可辨識，且不得遮蔽排程 bar。
- **FR-004**: 已排程 bar MUST 支援拖曳 Start 與 Due 端點以分別調整對應日期，並支援拖曳 bar 中段以等距移動整段排程。
- **FR-005**: 單日排程 MUST 可透過移動 bar 改變其原有日期，並可拖曳端點建立缺少的排程日期。
- **FR-006**: 未排程 Issue MUST 可由使用者在時間軸列拖曳起訖範圍建立排程；拖曳範圍的首尾日期均包含在排程內。
- **FR-007**: 拖曳接近時間軸邊緣且日期將超出目前範圍時，Gantt MUST 自動延伸日期範圍，讓使用者持續拖曳。
- **FR-008**: 排程拖曳 MUST 先呈現暫存預覽，並僅於拖曳完成時保存一次；取消操作 MUST NOT 寫入日期。
- **FR-009**: 排程修改 MUST 沿用 Gitea 唯一資料來源、目前使用者權限與既有版本衝突檢查；Start date Label 與 Due date 分開寫入可能部分成功，保存失敗時 MUST 顯示錯誤並重新讀取、呈現 Gitea 兩端實際排程。
- **FR-010**: 拖曳操作 MUST 維持有效日期順序，不得將 Start 設為晚於 Due。
- **FR-011**: 日期異常 Issue MUST 保留既有異常提示，且 MUST NOT 透過拖曳操作覆寫異常排程。
- **FR-012**: 排程端點 MUST 可用鍵盤操作，並以支援語系提供名稱、目前日期及操作結果；新增使用者可見文字 MUST 支援所有既有語系。
- **FR-013**: 本功能 MUST NOT 建立 Portal Issue 副本或改變既有 Issue 篩選、排序及其他檢視資料。
- **FR-014**: 使用者只修改排程日期時，系統 MUST 保留既有 Type、Priority 與其他未修改 Labels；日期更新 MUST NOT 要求使用者補填不相關欄位。

### Key Entities *(include if data is involved)*

- **Issue 排程**：Gitea 管理的 Start date 與 Due date；可為區間、單日或未排程狀態。
- **拖曳預覽**：使用者拖曳期間暫時呈現的候選日期，不是已保存資料；拖曳完成並成功保存後才成為 Gitea 排程。
- **今天標示**：依使用者當地日曆日期定位的時間軸呈現狀態，不另行保存。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 在四種時間刻度下，今天底色在標頭及所有可見 Issue 列均與實際今天日期對齊，日期定位錯誤案例為零。
- **SC-002**: 使用者可在一次拖曳中完成既有排程的 Start 或 Due 調整、整段移動，或建立未排程 Issue 區間，無須開啟 Issue 編輯頁。
- **SC-003**: 拖曳取消、版本衝突及 Gitea 寫入失敗的驗收案例中，Portal 不會顯示未保存日期為成功結果。
- **SC-004**: 所有日期端點均能以滑鼠及鍵盤操作，並在淺色、深色及窄螢幕版面下辨識。

## Assumptions

- 適用於 All repos 與 Repository 工作區的現有 Gantt，不變更排程資料模型或 Issue 編輯表單。
- 日期拖曳沿用既有 Issue PATCH 欄位和路徑；只放寬日期-only 更新對無關 Type/Priority 欄位的要求，不新增 endpoint 或改動已保存的 Label 語意。
- 日期以整日為單位；不支援時間或小時精度。
- Start 與 Due 的寫入仍受目前登入者 Gitea 權限限制；Portal 不使用更高權限身份代為寫入。
- Start date Label 與原生 Due date 使用不同 Gitea 寫入操作；本功能接受其中一端成功、另一端失敗的部分保存，並以重新讀取的實際值呈現，不自動回滾。
- Gitea 驗收環境中的 Issue 都是假資料，可任選一筆執行寫入驗收；測試前記錄原排程，測試結束後恢復原排程。
- 日期異常列沿用既有編輯流程修正，不允許由拖曳推測並覆寫其日期。
- 所有既有支援語系及淺色／深色主題均適用於新增標示和拖曳控制。
