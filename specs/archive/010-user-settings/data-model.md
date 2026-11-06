# Data Model: 使用者選單與外觀設定

本功能不新增伺服器端資料或 Gitea entity。偏好只存在於目前瀏覽器。

## Portal Session Identity

| Field   | Type   | Rule                                                                                     |
| ------- | ------ | ---------------------------------------------------------------------------------------- |
| `login` | string | 由既有 `/api/session` 提供；已登入時用於顯示帳號並隔離本機偏好。不得複製到後端設定資料。 |

## Theme Preference

| Field                | Type                          | Rule                                                                                                                 |
| -------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| account scope        | Portal login                  | 同一瀏覽器內每個 login 各自保存；不是跨裝置或跨瀏覽器同步身份資料。                                                  |
| mode                 | `light` \| `dark` \| `system` | 只接受三個值；缺少、無效或讀取失敗時以 `system` 為預設。                                                             |
| effective appearance | `light` \| `dark`             | `light`/`dark` mode 直接決定；`system` 由目前 OS/browser color preference 決定並可隨之改變。此值即時計算，不另保存。 |

## Lifecycle

1. Web 啟動時讀取目前 session login。
2. 使用 login 載入其本機 mode；沒有可用偏好時採 `system`。
3. 使用者切換 mode 時，立即更新有效外觀並保存該 login 的值。
4. logout、session 過期或另一個 login 登入不刪除既有偏好；其他 login 不得讀取或覆寫該值。
5. 本機快取清除後，該 login 下次使用時回到 `system`。
