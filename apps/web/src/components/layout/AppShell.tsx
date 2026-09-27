import { useEffect, useRef, useState, type ReactNode } from "react";
import { resolveAppRoute, routePaths, safeReturnTo } from "../../app/routes";
import { WorkspaceSelector } from "./WorkspaceSelector";

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
}: {
  children: ReactNode;
  login?: string;
}) {
  const route = resolveAppRoute(
    window.location.pathname,
    window.location.search,
  );
  const returnTo =
    route.type === "issue-detail" || route.type === "issue-create"
      ? safeReturnTo(
          new URLSearchParams(window.location.search).get("returnTo"),
        )
      : undefined;
  const returnUrl = returnTo
    ? new URL(returnTo, window.location.origin)
    : undefined;
  const contextRoute = returnUrl
    ? resolveAppRoute(returnUrl.pathname, returnUrl.search)
    : route;
  const boardId =
    contextRoute.type === "board-view" ? contextRoute.boardId : undefined;
  const repository =
    contextRoute.type === "repository-view" ? contextRoute : undefined;
  const boardView =
    contextRoute.type === "board-view"
      ? contextRoute.view
      : contextRoute.type === "board-selection"
        ? contextRoute.viewIntent
        : undefined;
  const onIssues =
    contextRoute.type === "issues" ||
    (contextRoute.type === "repository-view" &&
      contextRoute.view === "issues") ||
    (contextRoute.type === "board-view" && contextRoute.view === "issues");
  const onBoardSettings = route.type === "board-settings";
  const [isCrossRepositoryBoardSelected, setIsCrossRepositoryBoardSelected] =
    useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
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
      label: "Issues",
      href: repository
        ? routePaths.repositoryView(repository.owner, repository.repo, "issues")
        : boardId
          ? routePaths.boardIssues(boardId)
          : routePaths.issues,
      icon: "issues",
      active: onIssues,
    },
    {
      key: "kanban",
      label: "Kanban",
      href: boardId
        ? routePaths.boardView(boardId, "kanban")
        : repository
          ? routePaths.repositoryView(
              repository.owner,
              repository.repo,
              "kanban",
            )
          : routePaths.boardSelection("kanban"),
      icon: "kanban",
      active: boardView === "kanban" || repository?.view === "kanban",
    },
    {
      key: "gantt",
      label: "Gantt Chart",
      href: boardId
        ? routePaths.boardView(boardId, "gantt")
        : repository
          ? routePaths.repositoryView(
              repository.owner,
              repository.repo,
              "gantt",
            )
          : routePaths.boardSelection("gantt"),
      icon: "gantt",
      active: boardView === "gantt" || repository?.view === "gantt",
    },
  ];
  if (isCrossRepositoryBoardSelected) {
    navigationItems.push({
      key: "settings",
      label: "跨庫看板設定",
      href: routePaths.boardSettings,
      icon: "settings",
      active: onBoardSettings,
    });
  }

  return (
    <div
      className={`app-shell ${expanded ? "app-shell--expanded" : "app-shell--collapsed"}`}
    >
      <header className="topbar">
        <a className="brand" href={routePaths.issues}>
          Gitea Issue Portal
        </a>
        <WorkspaceSelector
          onCrossRepositoryBoardSelected={setIsCrossRepositoryBoardSelected}
        />
        {login && (
          <div className="account-menu" ref={accountMenuRef}>
            <button
              ref={accountTriggerRef}
              className="account-menu-trigger"
              type="button"
              aria-label={`目前使用者：${login}`}
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
              aria-label="使用者功能"
              hidden={!accountMenuOpen}
            >
              <a href={routePaths.settings}>設定</a>
            </nav>
          </div>
        )}
      </header>
      <div className="app-layout">
        <aside className="sidebar" aria-label="工作區導覽">
          <button
            className="sidebar-toggle"
            type="button"
            aria-label={`${expanded ? "收合" : "展開"}側邊導覽`}
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
            aria-label="主要導覽"
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
