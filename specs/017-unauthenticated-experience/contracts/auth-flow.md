# Authentication UI and Redirect Contract

## Session bootstrap

| Result | Web state | User-visible result |
|---|---|---|
| Session identity returned | Authenticated | Render current Portal route and shell |
| Explicit `401 auth.required` | Anonymous | Render standalone login experience; do not render protected route data or shell |
| Network, `5xx`, malformed response, or any other failure | Unavailable | Render localized service error and retry action; do not label the user unauthenticated |

The bootstrap keeps the existing single session lookup before the first app render. Retrying repeats that lookup.

## Login initiation

- The login control is a normal same-tab navigation to the existing OAuth login route.
- It passes the current Portal path and query as a candidate `returnTo`; all framework-reserved auth flash parameters are excluded from the saved target.
- The API accepts only same-site known Portal routes. It falls back to the Portal home route for absent or rejected targets.
- The authorization request includes a one-time random state paired with a short-lived HttpOnly transaction cookie.

## OAuth callback

- The callback requires a matching, unexpired, one-time state cookie before exchanging a code or creating a session.
- Success creates the current delegated Portal session and redirects to `WEB_ORIGIN + returnTo`.
- User denial and exchange failure create no session and redirect to the validated return target with a fixed, non-sensitive error key for localized display.
- Missing or invalid state creates no session and returns to the Portal home route with a generic login failure.
- Provider response bodies, access tokens, and internal exception details are never placed in the redirect URL or rendered to the user.

## Session expiry during Portal use

- A protected request returning `auth.required` triggers one same-tab page reload, excluding the initial `/api/session` request.
- If the protected request received 401 from Gitea, the API clears the rejected Portal session cookie before the client reloads so the next bootstrap cannot incorrectly report the session as authenticated.
- A one-time session-scoped flag carries only the fact that the session expired; no form values are stored.
- After a successful OAuth round trip, the current safe Portal route is reloaded. On Issue create/edit pages, a localized warning says unsent values were not retained and must be entered again.
- The client never automatically retries the protected request or repeats an Issue mutation after reauthentication.

## Portal logout

- The authenticated account menu exposes a localized sign-out button.
- Selecting it sends `POST /auth/logout` with the current Portal CSRF header. While the request is pending, the action is disabled to prevent duplicate requests.
- A `204` response expires both the HttpOnly `portal_session` cookie and the readable `portal_csrf` cookie. Only then does Web navigate to the Portal login page; opening a protected URL starts as anonymous.
- A network or non-success response leaves the user in the authenticated shell, displays a localized error, and keeps the action available for retry. The UI must not claim logout succeeded.
- The endpoint does not call Gitea's logout endpoint or clear IdP cookies. A later user-initiated Portal login can reuse Gitea SSO.

## Development routing

Vite proxies `/api` and `/auth` to the existing API service. The API callback redirects to configured `WEB_ORIGIN`, while the registered Gitea OAuth redirect URI remains the existing API callback URL.
