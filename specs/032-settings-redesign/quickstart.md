# Quickstart: 設定頁重設計與遷移功能退役

## Prerequisites

- Install workspace dependencies with `pnpm.cmd install` if needed.
- Start Storybook with `pnpm.cmd --filter @gitea-portal/web storybook`.

## Automated validation

```powershell
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd --filter @gitea-portal/web build-storybook
```

Search runtime source for retired support; expected result is no migration route/service/report type and no `workflow:` / `workflow-action:` compatibility checks under `apps/` or `packages/`:

```powershell
rg -n 'status-label-migration|StatusLabelMigration|workflow:|workflow-action:' apps packages
```

## Validation record

- 2026-10-03: Palette previews now show localized issue copy plus the production Todo, In Progress, and Done badges. Dark Storybook review confirmed all six palette previews stay visually distinct and use their own primary/status colors; Japanese dark layout wraps without overlap.
- 2026-10-03: Dark badge Storybook review confirmed Gitea-provided blue, pale yellow, and near-white Labels keep readable theme foreground text over subtle theme-aware fills; source values remain presentation-only.
- 2026-10-03: WCAG contrast calculation for black, white, blue, pale yellow and near-white Gitea colors across all 12 palette/appearance pairs returned a minimum 10.00:1 for Label foreground text against the tinted surface.
- 2026-10-03: `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd --filter @gitea-portal/web build-storybook` passed after the theme cohesion changes.
- 2026-10-03: `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd --filter @gitea-portal/web build-storybook` passed.
- Storybook review confirmed the six palette previews remain distinct in dark mode when changing the selected palette; Japanese locale selection matches the rendered copy, and the narrow Japanese story wraps without horizontal overflow.
- Contrast calculation for new palette text/surface, primary, secondary and status-label foreground/background pairs: all checked pairs are at least 5.16:1 in both appearances.
- Storybook build emitted its existing eval and large-chunk warnings; the build completed successfully.

## Settings Storybook scenarios

1. Render zh-TW, en and ja stories in light and dark themes; confirm the language, appearance mode and palette sections appear in that order, and titles, descriptions, controls and focus rings remain readable.
2. Select all six palettes in turn. Confirm each preview remains distinct while the selected state and page theme update. In dark mode, compare Carbon, Ember and Glacier for their graphite/citron, ink-plum/copper and blue-black/cyan identities; switch to light mode and confirm text and status colors remain readable.
3. Compare each preview's Status badges with the rendered badge family in the matching theme. Confirm Todo, In Progress and Done use the same semantic token pairs and every unselected preview remains unchanged while selecting palettes.
4. In light and dark appearances, review Gitea labels with dark, vivid and pale source colors. Confirm each keeps its hue as a subtle tint/border, text remains readable, and no label color is sent to Gitea. Confirm Issue identifiers remain prominent in dark mode while repository/date metadata stays secondary.
5. Inspect narrow (375px), tablet (768px) and desktop (1024px/1440px) viewports. Confirm no clipped text, overlap or horizontal overflow.
6. Use keyboard navigation only and confirm every preference can be selected and its current value is announced/visually distinguishable.
7. Confirm the settings page has no migration section. No authenticated Gitea write is expected or performed.

## Issue Status scenarios

- Current `status:` and `status-action:` labels still resolve and transition normally.
- An open Issue with only a historical workflow label is shown using the existing missing-status anomaly; its Gitea labels remain unchanged.
- Verify that the API does not register `/api/admin/status-label-migration` and migration report types are absent from current contracts.
