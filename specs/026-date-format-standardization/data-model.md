# Data Model: 日期格式統一

此功能不新增或修改資料模型、API contract、Gitea 欄位或 Portal persistence。以下為現有來源值及顯示規則：

| 顯示值 | 既有來源 | 格式與時區語意 |
|---|---|---|
| 日期-only | Issue `startDate`、`dueDate` | 保持來源日曆日，顯示 `YYYY/MM/DD`；格式化不可套用本地時區位移 |
| 日期時間 | Issue `createdAt`、`updatedAt`；Comment `createdAt` | 保持來源 timestamp，轉為瀏覽器本地時間後顯示 `YYYY/MM/DD HH:MM`；小時 00–23 |
| 甘特圖完整日期提示 | Timeline cell 的 calendar date | 日期-only 格式 `YYYY/MM/DD`；日期以外的星期／週末文案仍使用目前 locale 翻譯 |
| 甘特圖緊湊刻度 | Timeline calendar cells | 既有按尺度縮短顯示，不屬於完整日期格式範圍 |
| 日期輸入控制 | Browser native date input | 保留瀏覽器原生外觀與行為 |

缺失或無效的來源值沿用目前欄位的 fallback／anomaly 行為；formatter 不負責改寫或修補來源值。
