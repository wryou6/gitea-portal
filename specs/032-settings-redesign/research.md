# Research: 設定頁重設計與遷移功能退役

## Settings layout and palette preview

- **Decision**: Keep the existing React settings route and semantic CSS token system. Separate mode, palette and language into distinct responsive sections; scope each palette preview to its own palette tokens.
- **Rationale**: The current page puts all preferences in one card and applies one three-column layout to every group. Swatches read global variables, so every preview changes with the active palette. Independent token scope fixes the observed defect without a new component library or persistence model.
- **Alternatives considered**: Add a new settings framework or store draft selections separately. Both add dependencies/state while the current radio controls already apply and persist preferences immediately.

## Dark-first palette design

- **Decision**: Keep Cobalt, Juniper and Iris, and add Carbon (graphite/citron), Ember (ink plum/copper), and Glacier (blue-black/glacial cyan). Design the new palettes from their dark surface and primary colors first, then pair each with a readable light variant. Keep status roles distinct and check text contrast in both appearances.
- **Rationale**: The request identifies dark appearance as the weak point in the current palette set. Three differentiated accents (citron, copper and cyan) expand dark-mode choice while preserving the existing light-focused palettes and semantic token architecture.
- **Alternatives considered**: Replacing or retuning existing palettes would discard the light appearances users already prefer; adding close blue/green variants would not create meaningful dark-mode choice.

## Visual and interaction guidance

- **Decision**: Use the Portal's existing restrained, token-driven work-tool styling, with clear section hierarchy, visible keyboard focus, semantic radio groups, and responsive wrapping for translated copy.
- **Rationale**: UI Pro Max identifies Minimalism & Swiss Style as a strong enterprise/SaaS fit and recommends visible focus and keyboard navigation. Its SaaS product result also lists Minimalism & Swiss Style as a suitable secondary style. `ui-styling` guidance favors existing tokens, accessible native controls and mobile-first responsive composition.
- **Alternatives considered**: Glass effects, animation-heavy treatment, and new fonts are unnecessary for a preference screen and would make the existing Portal visual system less consistent.

## Locale and preference behavior

- **Decision**: Preserve supported locales (zh-TW, en, ja), current local-per-login preference keys/defaults, immediate updates, and System theme response.
- **Rationale**: Existing `theme-preference.ts`, `locale-preference.ts`, and app bootstrap already own these behaviors. Feature 032 changes their presentation only.
- **Alternatives considered**: Server-side preferences or a new locale mechanism would change privacy, session and API scope without user need.

## Palette cohesion, label color and dark-mode content

- **Decision**: Show a small realistic preview using the palette's actual semantic tokens and production Status badge styling. Reuse the same tokens within a palette-scoped preview element instead of maintaining a second hardcoded swatch map. Render Gitea labels with a restrained tint from their original color, theme foreground text, and a blended border. Give Issue identifiers the primary foreground role in dark mode.
- **Rationale**: Separate swatches did not reflect actual Status badge colors, while general Gitea labels only used their source color as a border and stayed neutral gray. Issue identifiers are meaningful navigation targets but inherited muted metadata contrast. Shared semantic tokens and hue-only accents keep palette previews truthful, the Gitea color recognizable, and text contrast stable across light/dark surfaces.
- **Alternatives considered**: Duplicating every palette's badge hex value in the preview perpetuates drift. Applying arbitrary Gitea colors directly as a badge background can produce unreadable text; changing colors on Gitea would violate the source-of-truth boundary.

## Legacy Status migration retirement

- **Decision**: Remove the migration route/service and every runtime legacy-prefix fallback or special-case. Continue recognizing current `status:` and `status-action:` labels only; do not modify any old Gitea labels.
- **Rationale**: This follows the user's explicit retirement decision and the current Gitea-as-source-of-truth boundary. Existing resolver anomaly behavior makes an open Issue with no current Status label visible as anomalous rather than silently inferring its state.
- **Alternatives considered**: Keep the migration API hidden or retain legacy fallback. Both preserve a function/compatibility the user explicitly retired. Rewriting historical feature 018 artifacts was rejected; this later feature supersedes its former migration gate.

## Validation approach

- **Decision**: Validate locale/theme/palette permutations in Storybook and build/type checks, and inspect residual legacy references in runtime code.
- **Rationale**: The primary UI failures are visual/state-coupling issues. Storybook can exercise deterministic preference states; static checks verify cross-package removal. Authenticated Gitea data is not mutated or required.
- **Alternatives considered**: An automated end-to-end Gitea migration test is not applicable because migration is being removed and this feature must not alter Issue data.
