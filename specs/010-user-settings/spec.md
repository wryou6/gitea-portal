# Feature Specification: 使用者選單與外觀設定

**Feature Branch**: `main`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: 在右上角新增查看目前登入的使用者的相關功能，點下去目前只有一個按鈕，之後會再新增多個，按鈕是設定，再點下去之後會到設定頁面，裡面可以設定 light dark system，設定記在 cache 裡面就好。

## Clarifications

### Session 2026-09-27

- Q: 如果不同 Portal 帳號共用同一個瀏覽器，外觀設定要共用一份，還是每個帳號各自保存？ → A: 每個帳號在同一瀏覽器各自保存外觀設定。

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 開啟使用者選單並前往設定 (Priority: P1)

已登入的工程師可以從 Portal 右上角確認目前登入的帳號，並使用「設定」入口前往個人設定頁面。此選單是後續使用者功能的共同入口；本次只提供「設定」一個功能項目。

**Why this priority**: 這是辨認目前帳號及找到本次新增設定的主要入口。

**Independent Test**: 以已登入帳號開啟右上角使用者選單，確認顯示目前帳號資訊及「設定」；選取「設定」後確認進入設定頁面。

**Acceptance Scenarios**:

1. **Given** 使用者已登入並位於 Portal 任一主要頁面，**When** 使用者開啟右上角選單，**Then** 選單至少顯示目前登入帳號的帳號名稱或使用者名稱，以及「設定」功能項目。
2. **Given** 使用者選單已開啟，**When** 使用者選取「設定」，**Then** Portal 開啟使用者設定頁面，且頁面明確顯示目前的外觀模式。
3. **Given** 使用者選單已開啟，**When** 使用者關閉選單或在選單外操作，**Then** 選單收起，原頁面仍可繼續操作。

---

### User Story 2 - 選擇並保留外觀模式 (Priority: P1)

工程師可以在使用者設定頁面選擇 Light、Dark 或 System，讓 Portal 外觀符合自己的閱讀偏好或作業系統設定。

**Why this priority**: 外觀模式是本次設定頁唯一提供的設定，需能套用並在再次開啟 Portal 時保持選擇。

**Independent Test**: 在設定頁分別選擇 Light、Dark 與 System，確認 Portal 外觀、重新載入後的選擇，以及 System 對作業系統外觀變更的反應。

**Acceptance Scenarios**:

1. **Given** 使用者正在設定頁，**When** 使用者選擇 Light 或 Dark，**Then** Portal 立即套用所選外觀，並保存選擇供重新載入後使用。
2. **Given** 使用者選擇 System，**When** 使用者檢視 Portal，**Then** Portal 外觀符合目前作業系統外觀；作業系統外觀改變時，Portal 隨之更新。
3. **Given** 使用者已選擇任一外觀模式，**When** 使用者重新載入 Portal 並再次開啟設定頁，**Then** 仍顯示先前選擇的模式。
4. **Given** 使用者尚未選擇過外觀模式，**When** 使用者首次開啟 Portal，**Then** 預設使用 System 模式。
5. **Given** 使用者只使用鍵盤操作，**When** 使用者開啟選單、前往設定並選擇外觀模式，**Then** 所有入口及選項均可到達、辨識與操作。
6. **Given** 使用者更改外觀模式，**When** Portal 套用並保存選擇，**Then** 只改變 Portal 顯示外觀，不改變登入狀態或任何 Gitea、Issue、Board 資料。
7. **Given** 兩個 Portal 帳號先後使用同一瀏覽器，**When** 各帳號選擇不同外觀模式並切換帳號，**Then** 各帳號只看到自己的已保存選擇；尚未設定的帳號使用 System。

### Edge Cases

- 使用者選擇的模式資料不存在或已被清除時，Portal 使用 System 模式並正常載入。
- 使用者切換頁面或重新載入時，已選擇的外觀不得短暫變成與設定不符的另一種模式。
- 窄視窗、鍵盤操作及淺色或深色外觀下，使用者選單與設定控制仍可辨識及操作。
- 若目前登入帳號沒有頭像或顯示名稱，選單仍須提供可辨認的帳號資訊，不得因此無法開啟設定。

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Portal MUST 在右上角提供已登入使用者可操作的使用者選單入口，並在選單中至少顯示目前登入帳號的帳號名稱或使用者名稱；頭像為可選資訊。
- **FR-002**: 本次使用者選單 MUST 提供「設定」作為唯一功能項目；使用者選取後 MUST 前往使用者設定頁面。
- **FR-003**: 使用者設定頁 MUST 提供 Light、Dark、System 三種外觀模式，並明確標示目前選擇。
- **FR-004**: 使用者選擇 Light 或 Dark 後，Portal MUST 立即套用所選模式；選擇 System 時 MUST 依作業系統目前的外觀設定呈現，並在該設定改變時更新。
- **FR-005**: 未有已保存選擇時，Portal MUST 預設使用 System 模式。
- **FR-006**: Portal MUST 將外觀模式選擇保存在目前瀏覽器的本機快取，並分別關聯至各 Portal 帳號，使選擇在重新載入或切換帳號後仍保留；此外觀設定不需保存至 Portal 或 Gitea 帳號資料，也不需跨瀏覽器同步。
- **FR-007**: 使用者選單及設定頁 MUST 在支援的螢幕尺寸與淺色、深色外觀下維持可讀、可操作，並支援鍵盤操作。
- **FR-008**: 使用者選單或本機外觀設定不得改變 Gitea 帳號、Issue、Board 或其他伺服器端資料。

### Key Entities _(include if data involved)_

- **目前登入帳號**：Portal 現有登入狀態所代表的使用者；選單只呈現可用的識別資訊，不建立另一份帳號資料。
- **外觀模式偏好**：使用者選擇的 Light、Dark 或 System 模式；由目前瀏覽器依 Portal 帳號分別保存，不作為 Portal 或 Gitea 帳號資料同步。

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 已登入使用者可從 Portal 右上角在兩次操作內到達設定頁，並可辨認目前登入帳號。
- **SC-002**: 使用者選擇 Light 或 Dark 後，Portal 所有主要頁面在 1 秒內呈現所選模式；System 模式與作業系統外觀保持一致。
- **SC-003**: 100% 的外觀模式選擇在重新載入及同瀏覽器帳號切換後仍正確顯示；若該帳號的選擇已從本機快取清除，Portal 回復為 System 模式。
- **SC-004**: 使用者首次使用或本機選擇資料不存在時，Portal 均以 System 模式正常顯示，且設定頁可繼續操作。

## Assumptions

- Portal 已提供目前登入帳號的識別資訊；本功能重用該資訊，不新增帳號資料或查詢其他使用者資料。
- 外觀選擇變更後立即生效，不需要額外的儲存按鈕。
- 「保存在 cache」代表在目前瀏覽器本機依 Portal 帳號分別保留選擇；該帳號的快取資料不存在時回復為 System，且不提供跨瀏覽器或跨裝置同步。
- 本次只新增使用者選單中的「設定」入口及外觀設定；其他使用者功能項目留待後續功能加入。
