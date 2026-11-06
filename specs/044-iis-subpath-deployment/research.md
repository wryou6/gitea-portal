# Research: IIS 子路徑部署支援

## Decision 1: Use one public base path across frontend URLs

- **Decision**: Build-time frontend base path controls static asset URLs, router basename, API requests, login URL, logout return URL, and favicon URL.
- **Rationale**: All browser-facing paths must remain within the IIS child application. The existing React Router and API client are shared entry points for navigation and requests.
- **Alternatives considered**: Add the prefix at each call site; rejected because routes can be missed and root-relative paths drift. Hard-code `/issue`; rejected because the existing root deployment must remain supported and other mount paths may be used.
- **Project evidence**: `apps/web/vite.config.ts`, `apps/web/src/main.tsx`, `apps/web/src/lib/api.ts`, `apps/web/src/features/auth/LoginPage.tsx`, and `apps/web/src/components/layout/AppShell.tsx`.

## Decision 2: Derive API callback and cookie paths from the public Portal URL

- **Decision**: Treat `WEB_ORIGIN` as the externally visible Portal URL, including its path when mounted below root. Derive the base path for OAuth return validation and cookie Path values from that URL.
- **Rationale**: The API must create OAuth callback state cookies and user session cookies that the browser sends to the child application, while keeping the existing root deployment behavior.
- **Alternatives considered**: Add a separate API base-path setting; rejected because it duplicates the path already represented by `WEB_ORIGIN` and can drift. Use cookie Path `/` for every mount; rejected because it exposes cookies to unrelated paths and does not meet the child-app scope.
- **Project evidence**: `apps/api/src/config/env.ts`, `apps/api/src/auth/oauth-return-to.ts`, `apps/api/src/auth/oauth-state.ts`, and `apps/api/src/auth/session.ts`.

## Decision 3: Preserve internal Fastify routes and ship a generic SPA fallback

- **Decision**: Keep API paths at `/api` and `/auth`; include an IIS URL Rewrite fallback in the static bundle for missing SPA paths, excluding API/auth requests and existing files. Hosting forwards public `/issue/api` and `/issue/auth` requests to the existing API routes.
- **Rationale**: This isolates the deployment prefix from API handlers and gives the copied static bundle a standard history-route fallback while leaving environment-specific API proxy rules to the target host. The user asked not to inspect the target IIS configuration.
- **Alternatives considered**: Prefix all Fastify routes with `/issue`; rejected because it couples the API process to a specific host mount. Require the host to supply all SPA fallback rules; rejected because a generic app-level fallback can ship with the files and reduce manual routing work. Let the frontend call the API on a separate origin; rejected because it changes same-origin session/CSRF behavior and is not needed for the provided deployment context.
- **Project evidence**: `apps/api/src/app.ts`, `apps/api/src/http/routes.ts`, `apps/api/src/http/auth-middleware.ts`, and `README.md`.

## Decision 4: Verify built artifacts locally; leave live IIS acceptance to the target host

- **Decision**: Verify typecheck, root build, `/issue/` build, emitted asset prefixes, included `web.config`, source path composition, and deployment contract. Do not claim host routing, IIS URL Rewrite availability, application-pool, or OAuth-provider callback acceptance without access to that environment.
- **Rationale**: The repository build can prove the generated frontend and API behavior at source level, but not the unavailable IIS site's forwarding or SPA fallback configuration.
- **Alternatives considered**: Treat a successful Vite build as IIS acceptance; rejected because it cannot prove host-level route forwarding or deep-link handling.
