import { useState, type ReactNode } from "react";
import { resolveAppRoute, routePaths } from "../../app/routes";

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

export function AppShell({ children }: { children: ReactNode }) {
  const route = resolveAppRoute(
    window.location.pathname,
    window.location.search,
  );
  const boardId = route.type === "board-view" ? route.boardId : undefined;
  const boardView =
    route.type === "board-view"
      ? route.view
      : route.type === "board-selection"
        ? route.viewIntent
        : undefined;
  const onIssues = ["issues", "issue-create", "issue-detail"].includes(
    route.type,
  );
  const onBoardSettings = route.type === "board-settings";
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
      href: routePaths.issues,
      icon: "issues",
      active: onIssues,
    },
    {
      key: "kanban",
      label: "Kanban",
      href: boardId
        ? routePaths.boardView(boardId, "kanban")
        : routePaths.boardSelection("kanban"),
      icon: "kanban",
      active: boardView === "kanban",
    },
    {
      key: "gantt",
      label: "Gantt Chart",
      href: boardId
        ? routePaths.boardView(boardId, "gantt")
        : routePaths.boardSelection("gantt"),
      icon: "gantt",
      active: boardView === "gantt",
    },
    {
      key: "settings",
      label: "Board Settings",
      href: routePaths.boardSettings,
      icon: "settings",
      active: onBoardSettings,
    },
  ];

  return (
    <div
      className={`app-shell ${expanded ? "app-shell--expanded" : "app-shell--collapsed"}`}
    >
      <header className="topbar">
        <a className="brand" href={routePaths.issues}>
          Gitea Issue Portal
        </a>
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
