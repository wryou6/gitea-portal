# Implementation Plan: Frontend UI Stack Migration

**Branch**: `004-frontend-ui-stack-migration` | **Date**: 2026-09-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-frontend-ui-stack-migration/spec.md`

## Summary

將目前 Gitea 跨 Repository Issue Portal 的自製 CSS 呈現層，遷移至 Tailwind CSS、shadcn/ui、Chart.js 與 Storybook。此次是前端技術還債與視覺/互動重整：新 framework 的元件結構、設計 token、狀態與可及性優先；既有部分 Issue/Comment/Board 操作可在初始遷移暫時不完整，後續再以新 framework 補齊。Gitea Source of Truth、權限邊界與 Board JSON 行為仍是不可突破的資料邊界。Chart.js 只建立可供未來使用的視覺化基礎，不新增 Dashboard 或改變產品範圍。

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Node.js workspace

**Primary Dependencies**: Existing Vite 6.x and React; Tailwind CSS 4.x; shadcn/ui source components; Chart.js 4.x; Storybook for React/Vite; one consistent SVG icon family only where icons improve recognition

**Storage**: N/A for the UI migration. Existing Board JSON persistence remains unchanged and is accessed through the existing API.

**Testing**: Existing `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd format:check`; Storybook stories for shared components and state coverage; manual validation scenarios in `quickstart.md`. No new test framework is introduced.

**Target Platform**: Internal-network web portal on modern desktop browsers, with responsive layouts at 375, 768, 1024, and 1440 CSS pixels.

**Project Type**: Existing pnpm monorepo web application with `apps/web` React/Vite frontend, `apps/api` Fastify API, and shared domain packages.

**Performance Goals**: Preserve current request behavior and perceived responsiveness; keep list and board interactions stable without broad unnecessary rerenders or layout shifts; avoid loading visualization code into routes that do not use it.

**Constraints**: Do not change API routes, request payloads, Gitea authorization, Issue data semantics, Board JSON schema, workflow compatibility rules, or Source of Truth boundaries. Frontend feature parity may temporarily regress when it conflicts with the new framework, but no old UI may be retained solely to hide the regression. Do not add a repository-local UI design skill or runtime skill dependency. Do not add a new dashboard page. Keep all user-facing copy in Traditional Chinese and preserve direct links to Gitea where an Issue link is present.

**Scale/Scope**: Existing Issues, Issue create/detail/edit/comments, Board list/editor, Kanban board/card/column, filters, workflow display, loading/error/empty/permission feedback, shared UI components, and Storybook stories. This is a presentation-layer migration across approximately the existing frontend feature surface, not a new backend system.

## Constitution Check

The generated constitution is still the repository's placeholder template and contains no ratified project principles. No constitution gate can be evaluated beyond the repository instructions in `AGENTS.md`.

Repository constraints are satisfied by this plan:

- Gitea remains the only Issue Source of Truth; no Issue mirror or frontend persistence is introduced.
- Existing API and domain boundaries remain intact.
- Board JSON persistence, validation, versioning, atomic write, and locking remain backend responsibilities and are not touched.
- Gitea permission boundaries and same-origin/CSRF request behavior remain intact.
- UI changes must pass typecheck and build before completion.
- Documentation and UI copy use Traditional Chinese; technical identifiers remain English where appropriate.

**Gate status before Phase 0**: PASS.

**Gate status after Phase 1 design**: PASS. The design artifacts define presentation-only changes and explicitly preserve the current API/data contracts.

## Phase 0: Research Decisions

The decisions are recorded in [research.md](./research.md). The global UI/UX design reference was used to select a Minimalism & Swiss direction, dense engineering-workspace patterns, accessible interaction states, and chart fallback requirements. No such tool or skill is installed in the repository.

## Phase 1: Design Artifacts

- [data-model.md](./data-model.md) defines UI-only view state and design-token entities; no persisted Issue or Board model is added.
- [contracts/ui-api-preservation.md](./contracts/ui-api-preservation.md) records the API and authorization contracts the frontend must preserve.
- [quickstart.md](./quickstart.md) defines runnable validation scenarios for the migrated UI.
- [../../design-system/gitea-issue-portal/MASTER.md](../../design-system/gitea-issue-portal/MASTER.md) records the visual system and component rules.

## Project Structure

### Documentation (this feature)

```text
specs/004-frontend-ui-stack-migration/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-api-preservation.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/web/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── feedback/
│   ├── features/
│   │   ├── issues/
│   │   ├── boards/
│   │   └── workflows/
│   ├── lib/
│   │   ├── api.ts
│   │   └── utils.ts
│   ├── index.css
│   └── main.tsx
├── .storybook/
├── package.json
└── vite.config.ts

design-system/
└── gitea-issue-portal/
    └── MASTER.md
```

**Structure Decision**: Keep the existing `apps/web/src/features` boundaries and API client. Add shared source-owned UI primitives under `components/ui`, layout primitives under `components/layout`, feedback states under `components/feedback`, and Storybook configuration under `apps/web/.storybook`. Consolidate global presentation tokens in `src/index.css`; remove only obsolete custom presentation files after every responsibility has moved.

## Complexity Tracking

No constitution violations or additional architectural complexity are required.
