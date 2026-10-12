# UI Contract: 工作檢視 Issue Badge

## Metadata badge editor

- **Trigger**: 優先級或類型 badge 是可聚焦按鈕，名稱說明 Issue 與目前欄位；點擊或鍵盤啟動可開啟候選值選單。
- **Choices**: Priority 為 Critical、High、Medium、Low；Type 為 Bug、Feature、Task。選單標示目前值；缺漏／衝突 badge 仍可開啟同一選單修復。
- **Commit**: 選擇候選值立即呼叫欄位更新 callback；相同值不送出重複更新。成功時選單關閉，父層讀回最新 Issue。
- **Failure**: 選單留開，顯示可理解的錯誤並允許重試或取消；badge 使用父層 Gitea 值，不顯示暫存值為成功。
- **Keyboard**: Trigger 可用 Enter／Space 開啟；選項可用 Tab 與 Enter／Space 選擇；Escape 關閉並將焦點還給 trigger。選項具目前值的無障礙狀態。
- **Kanban drag**: Trigger、選項與選單互動不得啟動或完成卡片拖曳。

## Status badge

- Issue List 與 Gantt 的有效 Status badge 可聚焦及啟動目前 Issue 可用 action 的既有轉換對話框。
- 對話框仍要求 action/reason、適用的 Assignee 選擇與確認；取消不送出寫入。
- Status anomaly 保持明顯、不可啟動轉換。
- Kanban 不新增卡片 Status badge；卡片拖曳維持既有 transition dialog。

## Localization and layout

所有新標籤、錯誤及 aria 名稱需提供 zh-TW、en、ja 翻譯。選單需在桌面、窄螢幕與明暗主題維持可讀且不遮擋必要卡片資訊。

## External API contract

無新增 API。metadata 更新沿用目前 Issue PATCH 與 `expectedUpdatedAt`；Status 更新沿用目前 transition command。
