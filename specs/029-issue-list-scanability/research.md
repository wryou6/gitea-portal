# Research: Issue list 欄位與預設排序調整

## Decision: 沿用既有 Issue sort 能力

- **Decision**: 預設使用 `dueDate` 升冪；不修改 API sort 欄位或查詢契約。
- **Rationale**: Issue list API 已支援 Due Date 比較、空值固定置後，並於主要排序相同時以 Key 升冪作為穩定次序。Web 已能由 URL 與偏好選擇排序欄位。
- **Alternatives considered**: 新增 API 特殊預設或變更 query fallback。拒絕，因為本需求只調整 Issue list 的產品偏好預設，其他 API 呼叫者不應被改變。

## Decision: 保留既有個人偏好

- **Decision**: 不遷移或覆寫已保存的完整 view preference；只有沒有有效偏好的帳號使用新產品預設，恢復預設則明確寫入新值。
- **Rationale**: 偏好 cookie 同時保存欄位、順序與預設排序，覆寫它可能改掉使用者的自訂設定。現有 URL 明確排序仍優先。
- **Alternatives considered**: 把既有 Key ascending 全部轉為 Due Date。拒絕，因目前資料無法區分使用者是否曾刻意選擇該排序。

## Decision: Key 欄維持可選

- **Decision**: Key 自新產品預設的 visible fields 移除，但保留排序欄位清單與 View Options 切換能力；Title 仍固定顯示。
- **Rationale**: 縮減預設表格寬度，同時保留使用者需要穩定 Issue 識別碼時的選擇。
- **Alternatives considered**: 從 Issue list 與欄位選項完全刪除 Key。拒絕，因需求確認 Key 僅不需預設顯示。

## Decision: 不新增 UI 字串

- **Decision**: 沿用現有 Key 欄位標籤、View Options 與三語系翻譯。
- **Rationale**: 功能只調整現有欄位預設，不新增可見文字。

## Decision: 保留 All repos 的 Repository 身分

- **Decision**: Key 隱藏後，All repos 在每筆 Issue Title 下方以次要文字顯示原始 `owner/repo`；Repository 專屬清單以工作區標題辨識來源。
- **Rationale**: 憲章 VI 要求跨 Repository 彙整中的每筆 Issue 標示所屬 Repository。現有 `IssueRow` 只有 Key cell 顯示 `owner/repo#number`，隱藏 Key 會移除該身份線索；標題副資訊保留來源且不新增表格欄。
- **Alternatives considered**: 增加獨立 Repository 欄。拒絕，因其增加表格寬度且可透過 Title cell 的次要資訊達成逐列辨識。
