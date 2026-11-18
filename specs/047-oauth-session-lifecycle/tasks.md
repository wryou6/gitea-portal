# Tasks: OAuth Session Lifecycle

## Phase 1: Secure stateless session cookie

- [X] T001 Add an AEAD encrypted, versioned cookie codec with strict payload validation and tests in `apps/api/src/auth/session.ts` and new auth tests.
- [X] T002 Add idle and absolute session timeout configuration with defaults and validation in `apps/api/src/config/env.ts` and `.env.example`.
- [X] T003 Set HTTPS-aware `Secure`, `HttpOnly`, `SameSite=Lax`, base-path-aware cookie attributes and enforce a maximum cookie size.
- [X] T004 Reject legacy signed-cookie sessions and document forced reauthentication on rollout and secret rotation.

## Phase 2: OAuth token refresh

- [X] T005 Parse and validate access and refresh token fields in the OAuth authorization-code response.
- [X] T006 Implement Gitea refresh-token grant exchange, expiry handling, refresh-token rotation, and focused unit tests.
- [X] T007 Add same-process single-flight coordination for concurrent refreshes without logging credential values.
- [X] T008 Integrate refresh into authenticated request handling and refresh near-expiry access tokens before use.
- [X] T009 Ensure token refresh completes before dispatching protected Gitea requests and never replay a request whose outcome may be uncertain.

## Phase 3: Error handling and user flows

- [X] T010 Preserve the safe OAuth return flow when preflight token renewal fails or Gitea rejects the current access token.
- [X] T011 Preserve 403, timeout, and upstream 5xx as permission/service errors without clearing session.
- [X] T012 Add API tests for OAuth return-path behavior, session expiry, logout cookie clearing, and IIS subpath behavior.
- [X] T013 Verify web bootstrap and API error handling show reauthentication only for confirmed invalid sessions.

## Phase 4: Documentation and delivery

- [X] T014 Update README and deployment runbook for cookie security, session lifetimes, one-process assumption, secret rotation, and stateless logout limitation.
- [X] T015 Run session/auth middleware tests, `pnpm.cmd typecheck`, and `pnpm.cmd build`; resolve failures and record results.

## Dependencies

- Phase 1 precedes Phase 2 because refresh credentials require the encrypted session payload.
- Phase 2 precedes Phase 3 because error classification depends on renewal outcomes.
- Phase 4 documentation follows the implementation decisions.
