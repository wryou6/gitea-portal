# Implementation Plan: IIS 子路徑部署支援

**Branch**: `044-iis-subpath-deployment` | **Date**: 2026-11-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/044-iis-subpath-deployment/spec.md`

## Summary

讓 Gitea Portal 可部署於 IIS 預設網站的 `/issue` 子應用程式，並保留根目錄預設行為。前端資源、React Router、API／認證請求使用同一公開 base path；API 依 `WEB_ORIGIN` 的 pathname 產生 OAuth 返回網址與 cookie Path。IIS／反向代理將公開 `/issue/api/*`、`/issue/auth/*` 轉送至 Fastify 原有 `/api/*`、`/auth/*` 路由，SPA 深層路徑回退至前端入口頁。

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 22 LTS

**Primary Dependencies**: React 19, React Router 8, Vite 6, Fastify 5

**Storage**: N/A; deployment path is configuration and is not persisted

**Testing**: `pnpm.cmd typecheck`, root production build with `VITE_BASE_PATH=/issue/`, and local artifact/route contract inspection. Live IIS acceptance is outside this repository-only plan.

**Target Platform**: IIS static site child application plus a separately running Node.js API process; root-path deployments remain supported

**Project Type**: pnpm web application workspace with React frontend and Fastify API

**Performance Goals**: No new runtime requests beyond existing API and asset requests; path handling adds no measurable page-load step

**Constraints**: Frontend base path and API `WEB_ORIGIN` path must match; the hosting layer must forward API/auth requests to the API process. The static package supplies an IIS URL Rewrite SPA fallback rule; the target host must enable URL Rewrite or equivalent. Do not inspect or assume the unavailable IIS configuration. Do not expose credentials in frontend output.

**Scale/Scope**: One Portal instance mounted at root or one configured child path; no new persistence or Gitea API behavior

## Constitution Check

- **I. Gitea is the only Issue data source**: PASS. No Issue data or persistence changes.
- **II. Requests follow current user permissions**: PASS. Existing delegated Gitea session and authorization path is unchanged.
- **III. Gitea writes are safe and verifiable**: PASS. No Gitea mutation behavior changes.
- **IV. Aggregated views are complete**: PASS. No aggregation behavior changes.
- **V. Fixed Issue Status semantics**: PASS. No status behavior changes.
- **VI. Work scope is clear**: PASS. No work-view data or scope changes.
- **VII. User-visible text uses i18n**: PASS. No new UI copy is required.
- **Additional constraints**: PASS. OAuth and session secrets remain API-only; no shared API contract schema changes.
- **Development process**: PASS after spec, plan, tasks, and analysis; UI routing changes require typecheck and build.

## Project Structure

### Documentation (this feature)

```text
specs/044-iis-subpath-deployment/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── deployment-path.md
└── tasks.md
```

### Source Code

```text
apps/api/src/
├── app.ts
├── auth/
│   ├── oauth-return-to.ts
│   ├── oauth-state.ts
│   └── session.ts
├── config/
│   ├── env.ts
│   └── web-path.ts
└── http/
    ├── error-handler.ts
    └── routes.ts

apps/web/
├── vite.config.ts
├── public/
│   └── web.config
└── src/
    ├── main.tsx
    ├── vite-env.d.ts
    ├── lib/api.ts
    ├── features/auth/LoginPage.tsx
    └── components/layout/AppShell.tsx
```

**Structure Decision**: Keep the existing `apps/web`, `apps/api`, and workspace package boundaries. This feature changes deployment URL composition only; it does not add a package, API response contract, or persistent entity.

## Design Decisions

- Use Vite's configured base URL as the frontend source of truth for bundled asset URLs, router basename, API requests, login and logout navigation.
- Derive the API cookie and OAuth return path from the pathname in `WEB_ORIGIN`; the value must be the public Portal URL, including a child path and trailing slash when mounted below root.
- Keep Fastify endpoint paths unchanged. The host forwarding contract maps public child-path API/auth routes to those existing endpoints.
- Normalize root and child paths so `/`, `/issue`, and `/issue/` do not create duplicated or missing separators.
- Include a generic IIS `web.config` in the static bundle for file-aware SPA fallback. Exclude API/auth paths; leave API reverse-proxy rules to the target host.
- Do not claim live IIS validation; record URL Rewrite availability and API forwarding as deployment prerequisites.

## Complexity Tracking

No constitution violations or new architectural components.
