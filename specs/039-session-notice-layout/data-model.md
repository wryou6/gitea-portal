# Data Model: 重新登入提示版面修正

本功能不新增持久化或領域資料。通知是暫存的介面狀態：

| 狀態 | 型別 | 生命週期 | 用途 |
|---|---|---|---|
| 提示是否開啟 | Boolean | 由登入恢復 bootstrap 初始化，直到使用者關閉或整頁載入 | 控制是否顯示提醒 |
| 使用者是否關閉 | Boolean UI state | 目前 React 單頁工作階段 | 關閉後切換 authenticated route 時維持隱藏 |

狀態不包含 Issue 欄位、Issue 草稿、access token 或其他認證資料。未送出的 Issue 內容不保存。
