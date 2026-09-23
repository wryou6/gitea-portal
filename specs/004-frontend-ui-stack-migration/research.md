# Research: Frontend UI Stack Migration

## Decision 1: Tailwind CSS with source-owned shadcn/ui components

**Decision**: Use Tailwind CSS for the styling foundation and add only the shadcn/ui source components required by the Portal. Keep components in the repository so the product owns their markup, variants, tokens, and accessibility behavior.

**Rationale**: The current frontend has a large custom stylesheet that mixes layout, visual tokens, feedback states, and feature-specific rules. Tailwind gives the migration a consistent token and responsive utility layer, while shadcn/ui supplies accessible primitives for tables, fields, dialogs, sheets, buttons, badges, cards, alerts, skeletons, and menus without introducing a hidden component runtime. The existing Issue and Board feature boundaries can remain intact.

**Alternatives considered**:

- Ant Design: broad ready-made surface, but would introduce a heavier visual opinion and more migration coupling than needed.
- MUI: mature and accessible, but its theme/runtime abstraction is more than this presentation-only migration needs.
- Keep the existing CSS: lowest short-term change, but leaves the documented presentation debt and makes consistent responsive/accessibility states harder to maintain.

## Decision 2: Install Chart.js as a future visualization foundation only

**Decision**: Add Chart.js to the web package, but do not add a dashboard or chart route in this feature. Any future trend visualization should use a line chart; categorical comparison should use a bar chart. Every chart must have a text summary or data-table fallback and must not rely on color alone.

**Rationale**: Chart.js is sufficient for likely Issue trend and status-distribution needs without creating an unnecessary visualization architecture now. Keeping it out of the initial route render avoids adding work to the core Issue and Board flows.

**Alternatives considered**:

- Apache ECharts: powerful and suitable for a later analytics-heavy feature, but unnecessary for the current scope.
- D3: maximum control but requires more bespoke accessibility and interaction work.
- Do not install a chart library: avoids unused code now, but does not satisfy the selected frontend stack direction and would defer the dependency decision to a later migration.

## Decision 3: Storybook for component and state review

**Decision**: Add Storybook for React/Vite and create stories for shared UI primitives, feedback states, Issue rows/cards, filters, Issue detail sections, Board cards, and Kanban columns. Stories should cover default, loading, empty, error, disabled, permission-limited, and responsive-relevant states where applicable.

**Rationale**: The migration replaces a presentation layer across several routes. Storybook provides an isolated review surface for the new primitives and prevents every visual state from being discoverable only through a live Gitea environment. It does not require introducing a new end-to-end test framework.

**Alternatives considered**:

- Manual browser checks only: useful for integration, but weak for reviewing reusable state variants.
- A new component test framework: out of scope because the project does not currently request a test-framework migration.

## Decision 4: Minimalism & Swiss visual direction for a dense engineering workspace

**Decision**: Use a restrained, high-density Minimalism & Swiss direction with neutral surfaces, strong grid alignment, clear typography hierarchy, semantic state colors, and light/dark theme tokens. Use a 4/8 spacing rhythm, visible focus rings, compact but touch-safe controls, and predictable responsive breakpoints.

**Rationale**: The Portal is an internal engineering workbench, not a marketing page. Users need to scan Repository, Issue number, title, state, assignee, labels, milestone, and update time quickly. A neutral grid and semantic accents preserve information density while allowing status and priority to remain recognizable. Broad glassmorphism, decorative gradients, and emoji icons would reduce signal quality and can create contrast or platform consistency problems.

**Alternatives considered**:

- Glassmorphism/dark-tech visual language: visually distinctive, but less suitable for dense tables and mixed light/dark enterprise usage.
- Card-heavy dashboard styling: easier to make visually expressive, but wastes space for cross-Repository Issue scanning.

## Decision 5: Preserve API and data boundaries

**Decision**: Do not add frontend persistence, an Issue cache database, new API routes, or new Gitea integration paths. Continue to use the existing API client and endpoint contracts. Board state and workflow transitions remain represented by Gitea-supported Issue information and the existing Board JSON backend.

**Rationale**: Gitea is the single Source of Truth. A UI stack migration must not change authority, authorization, synchronization, or failure semantics. Keeping the existing request boundary also limits the change surface and makes regressions easier to detect with the existing typecheck/build gates.

**Alternatives considered**:

- Introduce a frontend data store or local mirror: explicitly conflicts with the Source of Truth requirement.
- Refactor API payloads during the UI migration: increases unrelated risk and is not required for visual or interaction improvements.

## Decision 6: Keep licensing and design references explicit

**Decision**: Record the licenses of added runtime and development dependencies in the project documentation or package metadata as appropriate. The global design reference is used during planning only and is not copied into or installed by the repository.

**Rationale**: The Portal is an internal tool but should retain clear dependency provenance. The implementation should contain only the actual frontend packages needed at runtime or development time.

**Alternatives considered**:

- Copy an external design skill or its dataset into the repository: unnecessary duplication and contrary to the user's request to use the globally installed capability.
