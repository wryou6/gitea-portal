# Implementation Plan: 設定頁重設計與遷移功能退役

**Branch**: `032-settings-redesign` | **Date**: 2026-10-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/032-settings-redesign/spec.md`

## Summary

Redesign the existing settings route as a focused, responsive set of preference groups; isolate each palette preview from the active root palette; preserve immediate per-login appearance and locale preferences. Remove the obsolete Status Label migration UI, API path and report types, plus all runtime `workflow:` / `workflow-action:` interpretation while preserving current `status:` / `status-action:` handling and all Gitea labels.

## Technical Context

**Language/Version**: TypeScript 5.8, React 19

**Primary Dependencies**: Vite 6.1, Tailwind CSS 4 and existing semantic CSS variables; no new packages

**Storage**: Existing browser localStorage preferences keyed by Portal login; no server-side preference or Issue storage changes

**Testing**: Existing Storybook scenarios; `pnpm.cmd typecheck`, `pnpm.cmd build`, and Web Storybook build; manual responsive and locale review

**Target Platform**: Existing desktop and mobile web browsers; light/dark/system themes; zh-TW, en and ja

**Project Type**: pnpm monorepo Web UI and API/domain packages; scoped changes to existing workspaces only

**Performance Goals**: Preference changes remain immediate; no additional network requests for settings

**Constraints**: Preserve preference keys, defaults, account isolation and application behavior. Do not mutate Gitea Issues or Labels. Status transitions retain atomic replacement and optimistic concurrency. No runtime fallback from old prefixes.

**Scale/Scope**: One settings page, three appearance modes, six palettes (three established light-first palettes and three new dark-first palettes), three locales, and retirement of one admin migration flow plus its legacy-prefix compatibility paths.

## Constitution Check

- **PASS — Gitea source of truth**: No Issue mirror, Portal persistence, or migration of Gitea data is introduced. Existing Gitea labels remain untouched.
- **PASS — user permissions**: The obsolete admin-only migration endpoint is removed; no elevated or replacement operation is added.
- **PASS — safe writes**: Existing current-prefix Status transitions retain their atomic replacement and optimistic concurrency behavior; settings do not write Issue data.
- **PASS — complete work-view data**: Work-view aggregation and Issue status anomaly behavior remain intact.
- **PASS — fixed Status meaning**: Current `status:` labels and Gitea Closed semantics remain canonical. Historical `workflow:` labels cease to be interpreted; this feature supersedes feature 018's earlier migration-before-removal gate by explicit user direction.
- **PASS — localization**: Settings content remains in i18n resources for all supported locales; layout and focus behavior are reviewed across languages and widths.

## Design Decisions

1. **Keep the existing product language**: Use the Portal's semantic color tokens, restrained surfaces, spacing rhythm and current CSS architecture. The settings page is a work-tool screen, so use a quiet, Swiss/minimal layout rather than adding a new design system or visual dependency.
2. **Separate preference groups**: Present language first, then appearance mode, then palette in distinct titled sections with consistent card treatment and a readable content width. Let option grids adapt per group instead of forcing every group into the same three-column layout.
3. **Scope palette previews**: Each preview resolves its swatches against that palette's own token scope. The selected preference alone controls the document's active palette; all six preview cards remain stable in both light and dark themes.
4. **Design three dark-first palettes**: Add Carbon (graphite with electric citron), Ember (ink plum with warm copper), and Glacier (deep blue-black with glacial cyan). Establish each palette from its dark surfaces, foreground, primary and status roles first, then create a coherent light counterpart. Check text contrast and retain semantic distinctions for status colors.
5. **Preserve preference behavior**: Keep the existing per-login keys, defaults, immediate application, and System `prefers-color-scheme` behavior. No API/session changes.
6. **Retire the full migration path**: Remove the Settings action and status migration report strings/types, API route registration/handler, migration service and its contracts. Remove legacy-prefix fallback/exclusion handling from domain resolution, Issue action mapping, validation, schedule/status updates, Kanban labels and Issue edit labels. Preserve current-prefix behavior and show old-only open Issues through the existing missing-status anomaly path; do not alter their Gitea Labels.
7. **Historical spec boundary**: Feature 018 remains a record of the completed table/Status rollout. Feature 032 is the later explicit product decision that supersedes its compatibility-retention gate; do not rewrite historical feature artifacts as part of this implementation.
8. **Validate the real interface**: Expand Settings Storybook coverage for every locale, all six palettes, dark-first comparisons, light/dark rendering, long localized text, keyboard focus and responsive widths. Storybook/static checks do not claim authenticated Gitea runtime validation.
9. **Preview actual semantic UI**: Replace decorative palette swatches with a compact sample built from the same surface, text, primary and Status badge tokens used by the application. Scope each palette's existing semantic token declarations to the preview root as well as the document root so previews stay faithful without duplicating color values.
10. **Use Gitea label colors as theme-aware accents**: Keep each Gitea-provided label color in the rendered component only, apply a restrained color tint and border over the active card surface, and keep the label text on the theme foreground role. Strengthen dark-mode Issue identifiers to use the primary content foreground rather than muted metadata color.

## Project Structure

### Documentation

```text
specs/032-settings-redesign/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/settings-ui.md
└── tasks.md
```

### Source Code

```text
apps/web/src/features/settings/       Settings page, preferences, Storybook
apps/web/src/i18n/resources/settings.ts Settings copy for zh-TW/en/ja
apps/web/src/index.css                Settings layout and scoped palette previews
apps/web/src/lib/api.ts               Remove obsolete migration report type
apps/api/src/app.ts                   Remove obsolete migration route registration
apps/api/src/http/                    Remove migration route module
apps/api/src/issues/                  Remove migration service and legacy fallbacks
apps/api/src/work-views/              Keep current status labels, remove legacy exclusion
packages/domain/src/                  Resolve only current Status Labels
packages/gitea-contracts/src/         Remove obsolete migration report contract
```

**Structure Decision**: Reuse the existing pnpm workspace and feature modules. No new package, persistence layer, API replacement, or global design system is needed.

## Phase 0: Research

See [research.md](research.md). Existing code and local UI/UX guidance answer all stack and interaction questions; no unresolved technical clarification remains.

## Phase 1: Design & Contracts

- [Data model](data-model.md): existing local preference values and Gitea-owned Status labels; no new persisted entity.
- [Settings UI contract](contracts/settings-ui.md): layout, selection, localization, palette-preview isolation and retired migration surface.
- [Quickstart](quickstart.md): automated build checks and manual Storybook scenarios.

## Post-Design Constitution Check

- **PASS**: No migration or other Issue/Label write is introduced; existing Labels remain untouched.
- **PASS**: Existing `status:` transitions still preserve atomic replacement and concurrency checks.
- **PASS**: Current Gitea `status:` / `status-action:` values remain the only recognized workflow prefixes.
- **PASS**: All user-visible settings strings remain localized in zh-TW/en/ja, with responsive and keyboard acceptance coverage.
- **PASS**: Palette previews share production semantic tokens; label color changes affect rendering only, and dark-mode identifiers use the brighter theme foreground role.

## Complexity Tracking

No constitution violations or additional architectural complexity.
