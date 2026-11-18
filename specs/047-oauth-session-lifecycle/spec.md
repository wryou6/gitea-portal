# Feature Specification: OAuth Session Lifecycle

**Feature Branch**: `047-oauth-session-lifecycle`
**Created**: 2026-11-18
**Status**: Draft
**Input**: User request: Improve the current Portal login/session design gaps, including repeated reauthentication while Gitea SSO remains signed in.

## User Scenarios & Testing

### User Story 1 - Continue working while OAuth access tokens rotate (Priority: P1)

An engineer uses the Portal across normal access-token expiry and continues working without being sent through OAuth again while the authorization remains valid.

**Independent Test**: Use short-lived access tokens and verify protected read and write requests continue after token refresh without changing the Portal session or losing the current route.

**Acceptance Scenarios**:

1. **Given** a valid Portal session and an access token near expiry, **When** the user makes a protected request, **Then** the server refreshes the token and completes the request.
2. **Given** concurrent requests need the same token refresh, **When** they reach the API together, **Then** refresh-token rotation is serialized and every request uses the current token.
3. **Given** the refresh grant is expired or revoked, **When** token refresh is attempted, **Then** the Portal asks the user to authenticate again and preserves the safe return location.

### User Story 2 - Keep session credentials protected (Priority: P1)

An engineer's OAuth credentials remain unreadable to browser scripts and protected from tampering while Portal uses its existing single API process.

**Independent Test**: Inspect browser cookies, API responses, and logs to confirm session data is encrypted and credentials are absent from readable data and logs.

**Acceptance Scenarios**:

1. **Given** successful OAuth login, **When** the Portal creates a session, **Then** the browser receives an authenticated-encrypted cookie with secure attributes.
2. **Given** a valid session cookie reaches the API, **When** the session is resolved, **Then** its integrity and expiry are verified before credentials are used.
3. **Given** the user logs out, **When** logout succeeds, **Then** the current browser's Portal cookie is cleared while the Gitea browser login remains active.

### User Story 3 - Distinguish authorization loss from service errors (Priority: P1)

An engineer sees a reauthentication prompt only when Portal credentials are invalid or cannot be renewed, and sees a service or permission error for other failures.

**Independent Test**: Simulate Gitea 401, 403, timeout, and 5xx outcomes and verify the correct session and UI behavior for each.

**Acceptance Scenarios**:

1. **Given** an access token is approaching expiry, **When** a protected request arrives, **Then** the token is renewed before the request is sent to Gitea.
2. **Given** Gitea returns 403 or is unavailable, **When** a protected request fails, **Then** the Portal reports the corresponding error without clearing the session.
3. **Given** Portal session expiry is reached, **When** the user makes a protected request, **Then** the Portal requires authentication and safely preserves the return location.

## Edge Cases

- Refresh response omits, rotates, or returns malformed token fields.
- Concurrent API requests race to rotate a refresh token.
- API restarts or cookie secrets change while a browser still holds a session cookie.
- Cookie is missing, tampered, expired, or created under a deployment subpath.
- A write request receives an upstream 401 after the operation may have reached Gitea; the Portal must not blindly repeat a non-idempotent mutation.
- User logs out while other requests are in flight.
- Old signed-cookie sessions are presented after rollout.

## Requirements

### Functional Requirements

- **FR-001**: Portal MUST maintain a Portal session independently from the lifetime of an individual Gitea access token.
- **FR-002**: Portal MUST renew an access token before its known expiry using the OAuth refresh grant when the grant remains valid.
- **FR-003**: Portal MUST coordinate concurrent refreshes within the configured single API process and safely issue the latest rotated credentials.
- **FR-004**: Portal MUST NOT expose delegated credentials to frontend code, browser-readable session data, API responses, or logs.
- **FR-005**: Portal MUST use an authenticated-encrypted session cookie with secure attributes appropriate to HTTPS and configured base path.
- **FR-006**: Portal MUST operate without an external or persistent session store; deployment assumes one API process, and logout MUST clear the current browser's session cookie.
- **FR-007**: Portal MUST distinguish expired/revoked authorization from permission denial and temporary upstream failures.
- **FR-008**: Portal MUST complete proactive token renewal before dispatching a protected request and MUST NOT replay a request when its completion is uncertain.
- **FR-009**: Portal MUST enforce separately configured idle and absolute session lifetimes, defaulting to 12 hours idle and 30 days absolute.
- **FR-010**: When renewal cannot restore authorization, Portal MUST use the existing safe OAuth return flow and preserve the current Portal location.
- **FR-011**: Portal logout MUST invalidate only the Portal session and MUST leave the Gitea browser session intact.
- **FR-012**: Rollout MUST invalidate legacy cookies that contain embedded OAuth credentials and require one new OAuth authorization.

### Key Entities

- **Portal session**: User identity, lifecycle timestamps, revocation state, and associated delegated credentials.
- **OAuth grant**: Access token, refresh token, and their expiry metadata received from Gitea.
- **Portal session cookie**: Authenticated-encrypted browser-held session state containing the OAuth grant and lifecycle metadata.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of protected requests with a renewable authorization complete without an interactive OAuth round trip.
- **SC-002**: No access token or refresh token appears in browser-readable data, API response bodies, or application logs.
- **SC-003**: Concurrent requests within the API process result in no more than one active refresh operation per token generation.
- **SC-004**: Gitea permission and availability failures do not cause Portal sessions to be cleared.
- **SC-005**: Logout clears the current browser's Portal cookie and configured session expiry prevents subsequent protected requests using that cookie.

## Assumptions

- Gitea OAuth supports refresh-token grants for the configured application.
- Existing safe return-location validation and Gitea delegated permissions remain in force.
- Deployment uses one API process as documented in the IIS runbook; horizontal API scaling is outside this feature.
- OAuth credentials are carried only in an authenticated-encrypted HttpOnly cookie, not in a server-side session store, API response, or log.
- Session policy defaults to a 12-hour idle lifetime and a 30-day absolute lifetime, both configurable.
- Stateless logout clears the current browser cookie but cannot revoke a copied cookie before its expiry; this limitation is accepted for this design.
- Cookie security assumes production access over HTTPS; local development may require an explicit development-only setting.

## Clarifications

### Session 2026-11-18

- Q: Which session storage direction should the feature use? → A: Do not add a session store; use an authenticated-encrypted session cookie and the existing single API process.
- Q: What Portal session lifetime should apply independently of OAuth token expiry? → A: 12-hour idle timeout and 30-day absolute lifetime, configurable as deployment settings.
