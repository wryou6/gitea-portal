# Portal API Error Contract

## Response

Every API error response uses the existing response object with these fields:

```json
{
  "error": "Legacy human-readable message",
  "code": "issue.title_required",
  "params": {},
  "detail": "Optional original Gitea diagnostic detail"
}
```

- `code` is a required, stable semantic identifier for all API responses after migration. It is independent of HTTP status and message language.
- `params` is omitted when unused; otherwise it contains only scalar values needed to interpolate a localized message.
- `error` remains for existing consumers during this additive change. Web MUST select the message from `code`, not match or render `error` when a known code is present.
- `detail` is optional and reserved for raw upstream Gitea diagnostic detail. The Web UI preserves this value verbatim, separate from its localized summary.
- An absent or unknown code produces a localized generic API error. It MUST NOT cause Portal to translate or reinterpret arbitrary `detail` text.

## Code ownership

Portal owns the stable code catalog and its three localized messages. API routes, `PortalError`, and the Gitea error handler emit codes rather than relying on English/Chinese message text as an identifier. Add new codes and locale entries together. HTTP status behavior, Gitea permission checks, mutation semantics, and source data are unchanged.
