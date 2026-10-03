# Data Model: 設定頁重設計與遷移功能退役

## Existing local preferences

| Preference | Values | Identity and lifecycle |
|---|---|---|
| Appearance mode | `light`, `dark`, `system` | Browser-local and Portal-login scoped; missing/invalid value defaults to `system`; applied immediately |
| Color palette | `cobalt`, `juniper`, `iris`, `carbon`, `ember`, `glacier` | Browser-local and Portal-login scoped; missing/invalid value defaults to `cobalt`; applied immediately. Carbon, Ember and Glacier are designed dark-first with readable light counterparts. |
| Interface locale | `zh-TW`, `en`, `ja` | Browser-local and Portal-login scoped; missing value falls back to the supported browser locale, then `zh-TW`; applied immediately |

These values and storage behavior already exist. Feature 032 adds no persisted fields or server-side settings data.

## Gitea-owned Issue Status labels

- Current `status:` labels represent Todo/In Progress; Gitea Closed represents Done.
- Current `status-action:` labels represent the current transition action.
- Historical `workflow:` and `workflow-action:` labels remain untouched in Gitea but are no longer recognized as Status or action data by Portal.
- An open Issue with no current `status:` label continues to use the existing missing-status anomaly representation. No migration or inferred replacement value is created.
