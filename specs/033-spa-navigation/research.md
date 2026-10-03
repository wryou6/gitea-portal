# Research: 站內畫面切換不閃白

## Decision 1: Use React Router declarative browser navigation

**Decision**: Add React Router declarative APIs and mount one `BrowserRouter` around the current app. Keep `resolveAppRoute` as the route-to-page resolver and use Router location as the subscription that triggers page changes.

**Rationale**: The app already has a centralized path resolver and does not need Router data loaders or server rendering. `BrowserRouter` uses the browser History API and supports client-side links while allowing the existing page components and API hooks to remain intact.

**Alternatives considered**:
- Native History API with a custom location subscription: rejected because it duplicates mature link, navigation, and history behavior.
- Data/framework mode or server rendering: rejected because this feature is client-side navigation only and does not need server loaders or SSR.

**Sources**: [React Router BrowserRouter](https://reactrouter.com/api/declarative-routers/BrowserRouter), [React Router installation for data/declarative apps](https://reactrouter.com/start/data/installation).

## Decision 2: Make Router navigation the only application URL writer

**Decision**: Use `Link` for same-origin Portal anchors and `useNavigate` for event-driven navigation and query updates. Use Router location/search state as the source of truth when browser history changes.

**Rationale**: Direct `window.history.pushState`/`replaceState` changes the browser URL without notifying Router state. The repository currently writes URLs directly in the List state hook, Kanban filters, and Gantt preferences; these must move together to avoid URL/render divergence and preserve Back/Forward behavior.

**Alternatives considered**:
- Continue direct History API updates alongside Router: rejected because it creates two state owners and fails to guarantee React re-render on route changes.

**Sources**: [React Router Link](https://reactrouter.com/api/components/Link), [React Router useNavigate](https://reactrouter.com/api/hooks/useNavigate), [React Router useLocation](https://reactrouter.com/api/hooks/useLocation).

## Decision 3: Preserve document navigation for OAuth and external destinations

**Decision**: Intercept only same-origin Portal destinations. Keep external Gitea links and OAuth/authentication flows as ordinary document navigations.

**Rationale**: OAuth redirects and external Gitea pages leave the Portal application and retain their established browser behavior. Router links are used only for internal page changes; modified link clicks and new-tab behavior remain native.

**Sources**: [React Router Link](https://reactrouter.com/api/components/Link).

## Decision 4: Preserve deep-link fallback at the web host boundary

**Decision**: Verify direct open/refresh through the current Vite SPA server. The repository has no production web host configuration; any production static host must serve the Web entry document for Portal routes while leaving `/api`, `/auth`, and static assets correctly routed.

**Rationale**: Browser-history routing requires application paths to reach the client entry document on a hard refresh. Vite's default `appType: "spa"` includes SPA fallback. Production host configuration is not present in this repository and cannot be safely guessed.

**Sources**: [Vite `appType` configuration](https://vite.dev/config/shared-options#apptype), [Vite static deployment guide](https://vite.dev/guide/static-deploy).
