# Quickstart: IIS 子路徑部署支援

## Prerequisites

- Node.js 22 and pnpm 9 installed.
- Workspace dependencies installed with `pnpm.cmd install`.
- Valid API environment values available locally; do not commit secrets.
- For live deployment only: the target host forwards public API/auth paths to the Node API and provides SPA fallback for frontend paths.

## Build and Local Verification

1. Run workspace type checks:

   ```powershell
   pnpm.cmd typecheck
   ```

2. Build the `/issue` variant:

   ```powershell
   $env:VITE_BASE_PATH = "/issue/"
   pnpm.cmd build
   Remove-Item Env:VITE_BASE_PATH
   ```

3. Confirm `apps/web/dist/index.html` references `/issue/assets/...` and `/issue/favicon.svg`, and that `apps/web/dist/web.config` is present.
4. Inspect the generated frontend bundle for the `/issue/` base path, the `/api/session`, `/auth/login`, and `/auth/logout` endpoint fragments, and the router basename configured from that base.
5. Build the root variant with no `VITE_BASE_PATH` override and confirm assets and API/auth routes use `/`.
6. Confirm the API build includes path-aware OAuth return validation and cookies derived from `WEB_ORIGIN`.

## Host Acceptance

After publishing the `apps/web/dist` contents under `/issue`, verify direct entry and refresh for `/issue/`, `/issue/issues`, `/issue/kanban`, `/issue/gantt`, `/issue/settings`, and an Issue detail path. Also verify API read/write, OAuth success/failure, logout, and session expiration. Confirm IIS URL Rewrite is enabled and API/auth forwarding is configured. Local build evidence alone does not establish host routing or live OAuth acceptance.
