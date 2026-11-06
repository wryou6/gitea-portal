# Data Model: Issue Markdown Rendering

## Existing read data

This feature introduces no new entity, API field, or persisted data.

- **Issue description**: Existing `Issue.body` string supplied by the Gitea-backed Issue detail endpoint. Preserve it as raw Markdown and render at the Web presentation layer.
- **Issue comment**: Existing comment `body` string supplied by the Gitea-backed comments endpoint. Preserve its author and timestamp fields; render only the body at the Web presentation layer.

## Relationships and lifecycle

The Issue page continues to load the Issue and comments through the existing API calls. The renderer is a pure presentation of the latest returned values; edits and new comments continue through existing Gitea write paths.

## Validation and storage

No schema, validation, migration, contract, or persistence changes are required. Raw HTML remains disabled during rendering, and unsafe URI schemes must not become active links.
