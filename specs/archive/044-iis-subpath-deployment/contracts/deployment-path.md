# Deployment Path Contract

## Public URL

For a Portal mounted at `/issue`, the public application root is `/issue/`. At root deployment, the public application root remains `/`.

| Browser request                         | API process route / host behavior                                                   |
| --------------------------------------- | ----------------------------------------------------------------------------------- |
| `/issue/`                               | IIS serves the Portal static entry page                                             |
| `/issue/assets/*`, `/issue/favicon.svg` | IIS serves files from the deployed frontend bundle                                  |
| `/issue/api/*`                          | Host forwards to the API's existing `/api/*` routes                                 |
| `/issue/auth/*`                         | Host forwards to the API's existing `/auth/*` routes                                |
| `/issue/<SPA route>`                    | Included IIS rewrite rule serves the Portal entry page and keeps the requested path |

Representative SPA routes that must work on direct entry and refresh are `/issue/`, `/issue/issues`, `/issue/kanban`, `/issue/gantt`, `/issue/settings`, and `/issue/issues/{owner}/{repo}/{number}`.

The static bundle includes an IIS `web.config` rule that rewrites missing non-API/auth paths to `index.html`, while serving existing files and directories directly. It operates relative to the IIS application root, so the same file supports root or child-path deployment. IIS URL Rewrite must be available. API/auth forwarding removes the `/issue` public prefix before the request reaches Fastify and remains host-specific. SPA fallback must not capture API/auth requests.

## Configuration Agreement

- Frontend build base path is `/issue/` for this deployment.
- API `WEB_ORIGIN` is the complete public Portal URL, such as `http://portal-host/issue/`.
- Gitea OAuth callback is the same public host and `/issue/auth/callback` path.
- At root deployment, omit the frontend base override and use a root `WEB_ORIGIN` and root callback path.

## Browser-visible Behavior

- Assets, navigation, API/auth calls, and cookie paths remain scoped to the selected deployment path.
- OAuth success and errors return to a safe known route under the selected deployment path.
- The API's internal route contract remains `/api/*` and `/auth/*`.
