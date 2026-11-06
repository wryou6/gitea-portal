# Quickstart: Gantt 今天高亮與拖曳排程

## Prerequisites

- Portal Web/API 依根目錄 README 設定連到 Gitea 驗收環境。
- 使用者帳號對測試 Issue 有 Gitea Issue 更新權限。
- 驗收環境的 Issue 均為假資料；任選一筆，先記錄原 Start、Due 與相關 Labels，完成後還原並確認。
- 測試資料至少包含：Start+Due range、Start-only、Due-only、unscheduled 與日期 anomaly Issue。

## Static and Storybook validation

```powershell
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd --filter @gitea-portal/web build-storybook
```

Storybook 覆核 Gantt date header 與 row 在 Day、Week、2 weeks、Month 下對齊今天；包含週末、bar 經過今天、夜間主題、拖曳 handle、range preview、單日期端點、unscheduled 建立、日期順序 clamp、auto-scroll/extension、cancel、save success/error。以 zh-TW、en、ja 和 light/dark globals 檢視；使用 Storybook mock callback，不寫入 Gitea。

## Authenticated Gitea scenarios

1. 任選一筆有 Start 與 Due 的假資料 Issue，調整 Start，再調整 Due；重新載入確認兩日期來自 Gitea。
2. 平移 range 後確認日數不變；只拖一端時另一日期不變，且 Start 不晚於 Due。
3. 對 Start-only 與 Due-only Issue 平移原日期，再用缺失端點建立另一日期。
4. 在 unscheduled row 拖曳區間；確認首尾日期都包含，取消拖曳則資料不變。
5. 長距離拖曳至左右時間軸邊緣，確認自動捲動和日期延展不中斷 drag；完成後 Gantt 可見新日期。
6. 用鍵盤聚焦日期端點，以方向鍵預覽、Enter 保存及 Escape 取消；確認每一步均有可及名稱/狀態。
7. 在有權限的使用者工作階段製造 stale Issue version；確認錯誤後 UI 刷新成 Gitea 實際日期。若環境有無寫入權限帳號，再覆核 permission failure。
8. 確認 anomaly rows 不可拖曳，並保留異常提示和 Issue 編輯入口。
9. 讓第二個排程寫入失敗；確認錯誤後 Gantt 顯示 Gitea 已保存的 Start 與 Due 實際值，不保留預覽，也不假設回滾。

## Acceptance

- Gantt overlay/bar 日期以使用者本地 calendar day 對齊，不受 scale、月長、跨年或 DST 影響。
- 每次 pointer drag 最多提交一次日期 PATCH；取消和純點擊不寫入。
- Gitea 仍是已保存日期的唯一來源；錯誤/部分成功後不顯示未保存 preview 為成功值。
- `git diff --check`、`pnpm.cmd typecheck`、`pnpm.cmd build` 與 Web Storybook build 通過。
