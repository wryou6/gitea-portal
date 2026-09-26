# Quickstart: 可收合側邊導覽

## Prerequisites

- 已安裝 Node.js 22、Corepack 與 pnpm 9。
- 根目錄 `.env` 已有有效的本機 Gitea OAuth 設定。

## Start

```powershell
pnpm.cmd dev
```

登入 Portal 後，依序檢查下列流程。

## Acceptance Scenarios

1. **全站入口**：在 Issues、Issue 新增/詳情、Board 清單、Kanban 及 Gantt 頁面確認頂部品牌列仍顯示，且頂部不再有 Issues/Boards 連結。左側四項依序可到 Issues、Kanban、Gantt Chart、Board Settings。
2. **Board 檢視切換**：在某個 Board 的 Kanban 選 Gantt Chart，再選 Kanban；兩次都保持相同 Board。從 Issue 頁選 Kanban/Gantt 時先看到 Board 清單，選取 Board 後進入所選檢視。
3. **Board 管理與空狀態**：選 Board Settings，確認可列出、建立及編輯 Board。沒有 Board 時，Kanban/Gantt 導覽意圖仍提供建立 Board 的入口。
4. **收合狀態**：收合後只顯示四個圖示；展開後每個圖示有文字。收合後切換頁面和重新載入仍維持收合；新工作階段預設展開。
5. **Keyboard/accessibility**：只用鍵盤操作切換鈕與四個導覽項目；確認焦點可見、目前項目可辨識，圖示項目可取得可存取名稱。
6. **窄視窗**：在 375px 與 320px 寬度下展開/收合側欄；確認主要內容不被側欄覆蓋或裁切，且導覽項目仍可操作。
7. **資料邊界**：只切換導覽或側欄狀態；確認沒有因此修改 Issue、Board、Workflow Label 或排程資料。
8. **Canonical routes**：確認清單與新增 Issue 使用 `/issues`、`/issues/new`，Issue 詳情使用 `/issues/<owner>/<repo>/<number>`；無 Board 脈絡的檢視入口使用 `/kanban`、`/gantt`，Board Settings 使用 `/boards`，Board 內檢視使用 `/boards/<id>/kanban|gantt`。確認 `/`、舊 `/issue/...` 與 `/boards?view=...` 相容入口仍能載入對應頁面。

## Automated Project Checks

```powershell
pnpm.cmd typecheck
pnpm.cmd build
```

預期兩個指令均成功；不新增或執行自動化測試套件作為本 feature 的工作項目。
