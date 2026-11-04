# Research: Issue Markdown Rendering

## Decision: Render Markdown as React elements with GFM extensions

- **Decision**: Use `react-markdown` with `remark-gfm` in the Web app and a shared component for Issue descriptions and comments.
- **Rationale**: The existing UI is React and receives the original Markdown strings. The React renderer supports plugin-based Markdown parsing without introducing an HTML injection step; the GFM plugin provides tables, task lists, strikethrough, and related extensions.
- **Alternatives considered**: Converting content to HTML in the API would add a server-side rendering dependency and a new trust boundary; using Gitea's Markdown render API would add a network request and change the existing read path. Neither is needed for the agreed common Markdown + GFM scope.
- **Sources**: [react-markdown documentation](https://github.com/remarkjs/react-markdown), [remark-gfm documentation](https://github.com/remarkjs/remark-gfm).

## Decision: Keep raw HTML disabled and retain safe URL transformation

- **Decision**: Do not enable raw HTML parsing; use the renderer's default URL transform for links and images.
- **Rationale**: Issue and comment bodies are user-controlled content. The renderer documents safe behavior by default, raw HTML is escaped or ignored unless a raw-HTML plugin is enabled, and its default URL transform filters unsafe protocols. This meets the spec without adding a separate HTML sanitization layer.
- **Alternatives considered**: Enabling raw HTML would require a sanitization pipeline and broader security review; it is outside the agreed scope.
- **Sources**: [react-markdown security guidance](https://github.com/remarkjs/react-markdown#security), [react-markdown URL transform API](https://github.com/remarkjs/react-markdown#defaulturltransform), [GFM extensions](https://github.com/remarkjs/remark-gfm).
