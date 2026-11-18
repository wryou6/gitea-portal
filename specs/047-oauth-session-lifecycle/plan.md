# Implementation Plan: OAuth Session Lifecycle

## Summary

Replace the signed, readable session cookie with an authenticated-encrypted stateless cookie. Preserve the current single Node.js API process deployment and avoid adding a session store. Add OAuth refresh-token renewal, explicit idle and absolute lifetimes, and correct authentication error classification.

## Technical Context

- Runtime: Node.js, TypeScript, Fastify API, React/Vite web app.
- OAuth provider: existing Gitea OAuth application and delegated user token.
- Current deployment: one independent Node.js API process behind IIS reverse proxy; no Redis or database is configured.
- Existing cookie: HMAC-signed Base64 JSON containing access token; OAuth callback ignores refresh token.
- Constraints: preserve Gitea authorization delegation, safe return locations, logout retaining Gitea SSO, deployment subpath support, no token in logs or frontend-readable data.

## Architecture

- Introduce a versioned AES-256-GCM session-cookie format with authenticated metadata and a separately derived encryption key from `PORTAL_SESSION_SECRET`. Reject malformed, expired, or legacy cookies. Use `Secure` in production, `HttpOnly`, `SameSite=Lax`, and `webBasePath`.
- Include access token, refresh token, access-token expiry, issue time, last activity, and absolute expiry in the encrypted cookie payload. Refresh before expiry with a bounded safety window. Keep cookie size within common browser limits and fail OAuth completion cleanly if it cannot be issued.
- Refresh the idle timestamp and reissue the cookie on authenticated responses, while preserving the absolute expiry. All API responses from this single process must use the same cookie update path.
- Add OAuth refresh-token exchange. Preserve the old refresh token only when Gitea omits a replacement. Coordinate same-process concurrent refreshes by refresh-token fingerprint and finish renewal before dispatching the protected request. Do not replay requests after uncertain outcomes.
- Because stateless cookies have no server-side revocation record, logout clears the current browser cookie. A copied cookie remains usable until expiry. The 12-hour idle and 30-day absolute defaults bound that exposure. Multiple API processes and cross-process refresh serialization are out of scope.
- Cookie encryption protects confidentiality and integrity but does not prevent replay of a copied cookie. The session is client-carried state, not a server-side session record.
- Update error handling so only confirmed invalid authorization clears the browser session. Preserve 403 as permission denied and transport/timeout/5xx as service unavailable. Avoid clearing cookies in generic error handling before refresh is attempted.

## Data Model and Configuration

- `PortalSessionCookieV2`: version, login/profile, access token, refresh token, access expiry, issued-at, last-activity, absolute expiry, and CSRF token.
- Add configurable `PORTAL_SESSION_IDLE_TIMEOUT_MS` defaulting to 43,200,000 and `PORTAL_SESSION_ABSOLUTE_TIMEOUT_MS` defaulting to 2,592,000,000.
- Derive authenticated encryption key material from the existing `PORTAL_SESSION_SECRET`; no new credential or storage service. OAuth token values remain in the encrypted client-carried cookie and are not written to Portal server-side persistence.
- Update `.env.example`, configuration validation, and README security/deployment notes.

## Implementation Phases

1. Add encrypted cookie codec, validation, cookie attributes, session expiry policy, and focused tests. Legacy cookie values become anonymous.
2. Parse OAuth refresh tokens and implement refresh exchange, same-process refresh coordination, and safe request retry behavior.
3. Reclassify upstream errors, integrate API and web reauthentication behavior, preserve route return, and test logout and subpath cookies.
4. Update deployment/configuration documentation and run full typecheck/build plus relevant API and web tests.

## Risks and Mitigations

- Refresh rotation can race when multiple requests arrive together. Use in-process single-flight and ensure the refreshed cookie is issued to all waiting responses where possible.
- Browser cookie size may exceed limits for unusually large OAuth tokens. Add explicit size validation and a clear login failure response.
- Stateless logout cannot revoke copied cookies. Bound the risk with absolute/idle expiry and document the limitation.
- A changed `PORTAL_SESSION_SECRET` invalidates all existing sessions. Document rotation as a forced reauthentication event.

## Validation

- Unit tests for encryption integrity, tampering, malformed values, expiry, key derivation, cookie attributes, and legacy-cookie rejection.
- OAuth tests for authorization-code token parsing, refresh grant, rotated/omitted refresh token, rejected refresh, timeout, and malformed responses.
- API tests for access-token expiry renewal, concurrent refresh, one-time safe retry, no write replay after uncertain outcome, 403/5xx handling, logout, and subpath behavior.
- Web tests for authenticated bootstrap, reauthentication return path, session-unavailable state, and no reauthentication on permission/service failures.
- Run `pnpm.cmd typecheck`, `pnpm.cmd build`, and relevant API/web tests.
