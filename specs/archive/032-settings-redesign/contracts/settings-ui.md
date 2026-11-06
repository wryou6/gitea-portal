# Settings UI Contract

## Settings page

- Route remains `/settings`; the existing authenticated account identity remains available where currently shown.
- Interface language, appearance mode, and color palette appear as distinct, titled sections in that top-to-bottom order.
- Selecting a mode, palette, or locale applies it immediately and keeps the existing per-login browser preference behavior.
- Palette cards show simultaneous, stable previews for Cobalt, Juniper, Iris, Carbon, Ember, and Glacier. The active page palette changes on selection; other previews do not change. Carbon, Ember, and Glacier are designed dark-first with readable light counterparts.
- Each palette preview demonstrates its actual surface, foreground, primary action color and three production Status badge roles using that palette's semantic tokens; previews do not maintain duplicate badge color values.
- A Gitea Label's supplied color is rendered as a restrained theme-aware tint and border while text uses the active theme foreground. This is presentation-only and never writes a color change to Gitea.
- In dark mode, Issue identifiers use the theme's brighter primary content foreground and remain visually distinct from secondary metadata.
- All labels and descriptions are available in zh-TW, en, and ja. Content wraps without clipping or horizontal overflow at supported widths.
- Native radio semantics, keyboard operation, visible focus and selected state are preserved.

## Retired migration surface

- Settings no longer displays a Status Label migration section or starts migration work.
- Portal exposes no Status Label migration operation.
- Portal recognizes current `status:` / `status-action:` labels only. It does not interpret or mutate old `workflow:` / `workflow-action:` labels.

## Preserved boundaries

- No preference value is sent to the API or Gitea.
- No Issue or Label is changed by settings or by retiring the migration operation.
- Existing current-prefix Status transitions continue using the established Gitea write behavior.
