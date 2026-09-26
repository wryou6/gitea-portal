# 快速驗收：Issue Type 規範

## 編譯檢查

```powershell
pnpm.cmd typecheck
pnpm.cmd build
```

## 手動驗收情境

使用登入者有 Issue 與 Label 寫入權限的 Gitea Repository：

1. 開啟 Portal 的「建立 Issue」，不選 Type 後送出；確認表單阻止提交。
2. 分別選 Bug、Feature、Task 建立 Issue；在 Gitea 確認每張 Issue 恰有對應的 `type:*` Label，且保留指定的一般 Labels。
3. 編輯 Issue，只改標題或一般 Labels；確認原 Type Label 保留。
4. 同時改 Type 與排程欄位；確認 Issue 帶有所選 Type、保留的一般 Labels 與指定的 Start date Label。
5. 開啟缺少 Type、帶兩個 Type、或帶無效 `type:` Label 的 Issue；確認清單與詳情標示異常並顯示完整 Labels，編輯表單要求先選一種有效 Type。
6. 移除 Label 寫入權限或讓 Gitea Label 操作失敗；確認 Portal 顯示失敗，沒有回報 Issue 寫入成功。
7. 開啟 Portal 編輯表單後，改由 Gitea 更新同一張 Issue 再儲存；確認 Portal 顯示既有並行變更錯誤，沒有覆蓋最新 Labels。
8. 把已有 Type 的 Issue 移動到 Board 另一個狀態，並讓 Portal 修復 Workflow 異常；確認 Type Label 仍保留。

可在 Gitea 檢查 Portal 的寫入結果，因 Gitea 是唯一持久化資料來源。
