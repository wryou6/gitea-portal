# Data Model: IIS 子路徑部署支援

本功能不新增 Portal 持久資料。以下為部署時的設定與路徑概念。

## PublicDeploymentPath

- **Value**: Root (`/`) or a normalized child path such as `/issue`.
- **Source**: Frontend build setting; API derives its corresponding path from the public Portal URL.
- **Rules**: A child path has one leading slash, no trailing slash in normalized comparisons, and is applied with exactly one separator when constructing URLs. Root remains the default.
- **Relationship**: Scopes all browser-facing assets, navigation, API/auth entry points, OAuth return destinations, and authentication cookies.

## PortalRoute

- **Value**: Existing internal application route, such as `/issues`, `/kanban`, `/gantt`, `/settings`, or an Issue detail path.
- **Rules**: The public URL prepends the configured deployment path. The hosting layer serves the frontend entry for known SPA paths while preserving the requested browser URL.

## AuthenticationCookie

- **Values**: Portal session, CSRF token, and short-lived OAuth transaction cookies.
- **Rules**: Cookie Path matches the deployment path; expiration and logout clear cookies using the same path used to set them.
- **Persistence**: Browser cookies only; this feature does not add server-side token persistence.
