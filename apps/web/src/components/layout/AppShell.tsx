import { useEffect, useRef, useState, type ReactNode } from "react";
import { resolveAppRoute, routePaths, safeReturnTo } from "../../app/routes";
import { WorkspaceSelector } from "./WorkspaceSelector";
import { useTranslation } from "react-i18next";
import type { Repository } from "../../lib/api";
import { api } from "../../lib/api";

const SIDEBAR_STATE_KEY = "gitea-portal:sidebar-expanded";

type NavigationIconName = "issues" | "kanban" | "gantt" | "settings";

function NavigationIcon({ name }: { name: NavigationIconName }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === "issues" && (
        <>
          <path d="M8 6.5h12M8 12h12M8 17.5h12" />
          <path d="M4 6.5h.01M4 12h.01M4 17.5h.01" strokeWidth="3" />
        </>
      )}
      {name === "kanban" && (
        <>
          <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
          <path d="M9 4.5v15M15 4.5v15" />
        </>
      )}
      {name === "gantt" && (
        <>
          <path d="M4 5h2M4 10h2M4 15h2M4 20h2" />
          <path d="M9 5h8M12 10h7M8 15h10M14 20h5" />
        </>
      )}
      {name === "settings" && (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 0 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 0 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 0 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z" />
        </>
      )}
    </svg>
  );
}

export function AppShell({
  children,
  login,
  routePathname,
  routeSearch,
  workspaceRepositories,
}: {
  children: ReactNode;
  login?: string;
  routePathname?: string;
  routeSearch?: string;
  workspaceRepositories?: Repository[];
}) {
  const { t } = useTranslation("common");
  const { t: authT } = useTranslation("auth");
  const pathname = routePathname ?? window.location.pathname;
  const search = routeSearch ?? window.location.search;
  const route = resolveAppRoute(
    pathname,
    search,
  );
  const returnTo =
    route.type === "issue-detail" || route.type === "issue-create"
      ? safeReturnTo(
          new URLSearchParams(search).get("returnTo"),
        )
      : undefined;
  const returnUrl = returnTo
    ? new URL(returnTo, window.location.origin)
    : undefined;
  const contextRoute = returnUrl
    ? resolveAppRoute(returnUrl.pathname, returnUrl.search)
    : route;
  const repository =
    contextRoute.type === "repository-view" ? contextRoute : undefined;
  const allReposView = contextRoute.type === "all-repositories-view" ? contextRoute.view : undefined;
  const onIssues =
    contextRoute.type === "issues" ||
    (contextRoute.type === "repository-view" && contextRoute.view === "issues");
  const onDashboard = route.type === "dashboard";
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [logoutFailed, setLogoutFailed] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountTriggerRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState(() => {
    try {
      return window.sessionStorage.getItem(SIDEBAR_STATE_KEY) !== "collapsed";
    } catch {
      return true;
    }
  });

  const toggleSidebar = () => {
    setExpanded((current) => {
      const next = !current;
      try {
        window.sessionStorage.setItem(
          SIDEBAR_STATE_KEY,
          next ? "expanded" : "collapsed",
        );
      } catch {
        // Keep the in-memory control usable if browser storage is unavailable.
      }
      return next;
    });
  };

  const logout = async () => {
    if (logoutPending) return;
    setLogoutPending(true);
    setLogoutFailed(false);
    try {
      await api<void>("/auth/logout", { method: "POST" });
      window.location.assign("/");
    } catch {
      setLogoutFailed(true);
      setLogoutPending(false);
    }
  };

  useEffect(() => {
    if (!accountMenuOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !accountMenuRef.current?.contains(event.target)
      ) {
        setAccountMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
        accountTriggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountMenuOpen]);

  useEffect(() => {
    setAccountMenuOpen(false);
  }, [login]);

  const navigationItems: Array<{
    key: string;
    label: string;
    href: string;
    icon: NavigationIconName;
    active: boolean;
  }> = [
    {
      key: "issues",
      label: t("issues"),
      href: repository
        ? routePaths.repositoryView(repository.owner, repository.repo, "issues")
        : routePaths.issues,
      icon: "issues",
      active: onIssues,
    },
    {
      key: "kanban",
      label: t("kanban"),
      href: repository
          ? routePaths.repositoryView(
              repository.owner,
              repository.repo,
              "kanban",
            )
          : routePaths.kanban,
      icon: "kanban",
      active: allReposView === "kanban" || repository?.view === "kanban",
    },
    {
      key: "gantt",
      label: t("gantt"),
      href: repository
          ? routePaths.repositoryView(
              repository.owner,
              repository.repo,
              "gantt",
            )
          : routePaths.gantt,
      icon: "gantt",
      active: allReposView === "gantt" || repository?.view === "gantt",
    },
  ];

  return (
    <div
      className={`app-shell ${expanded ? "app-shell--expanded" : "app-shell--collapsed"}`}
    >
      <header className="topbar">
        <div className="topbar-primary">
          <div className="brand" aria-label="Gitea Portal">
            <img className="brand-mark" src="/favicon.svg" alt="" />
            <span>Gitea Portal</span>
          </div>
          <a
            className="dashboard-link"
            href={routePaths.dashboard}
            aria-current={onDashboard ? "page" : undefined}
          >
            {t("dashboard")}
          </a>
        </div>
        <WorkspaceSelector
          initialRepositories={workspaceRepositories}
          initialPathname={routePathname}
        />
        {login && (
          <div className="account-menu" ref={accountMenuRef}>
            <button
              ref={accountTriggerRef}
              className="account-menu-trigger"
              type="button"
              aria-label={t("currentUser", { login })}
              aria-expanded={accountMenuOpen}
              aria-controls="account-menu-panel"
              onClick={() => setAccountMenuOpen((open) => !open)}
            >
              <span className="account-menu-login">{login}</span>
              <span aria-hidden="true">▾</span>
            </button>
      <nav
              id="account-menu-panel"
              className="account-menu-panel"
              aria-label={t("userMenu")}
              hidden={!accountMenuOpen}
            >
              <a href={routePaths.settings}>{t("settings")}</a>
              <button type="button" onClick={() => void logout()} disabled={logoutPending}>
                {t(logoutPending ? "loggingOut" : "logout")}
              </button>
              {logoutFailed && <p className="account-menu-error" role="alert">{authT("logoutFailed")}</p>}
            </nav>
          </div>
        )}
      </header>
      <div className="app-layout">
        <aside className="sidebar" aria-label={t("globalNavigation")}>
          <button
            className="sidebar-toggle"
            type="button"
            aria-label={t(expanded ? "collapseSidebar" : "expandSidebar")}
            aria-expanded={expanded}
            aria-controls="primary-navigation"
            onClick={toggleSidebar}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={expanded ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
            </svg>
          </button>
          <nav
            id="primary-navigation"
            className="sidebar-nav"
            aria-label={t("globalNavigation")}
          >
            {navigationItems.map((item) => (
              <a
                key={item.key}
                className="sidebar-link"
                href={item.href}
                aria-label={item.label}
                aria-current={item.active ? "page" : undefined}
                title={!expanded ? item.label : undefined}
              >
                <NavigationIcon name={item.icon} />
                <span className="sidebar-label">{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
