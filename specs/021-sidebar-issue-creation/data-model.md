# Data Model: 側邊導覽建立問題入口

本功能不新增持久化資料、API 欄位或 Gitea 欄位。

## Global Navigation Item

| Attribute | Meaning | Rule |
|---|---|---|
| Key | Stable navigation identity | Unique among AppShell navigation items |
| Label | Localized action name | Traditional Chinese, English, and Japanese; accessible in expanded and collapsed sidebar |
| Destination | Existing Issue create route | Repository route when a Repository workspace is active; otherwise the existing global route |
| Return context | Current page URL when a Repository-specific create route is used | Preserve existing create-page navigation semantics |
| Active state | Whether current route is Issue creation | Mark only Create as current; keep the Repository selector scoped using the return context |

## Create Target Repository

The target Repository remains owned by the existing Issue create flow: a Repository workspace supplies its Repository, while All repos uses the existing Repository selector. Gitea remains the source of truth and applies the signed-in user's permissions.
