import type { ReactNode } from "react";
export function AppShell({ children }: { children: ReactNode }) {
  const path = window.location.pathname;
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/">
          Gitea Issue Portal
        </a>
        <nav aria-label="主要導覽">
          <a href="/" aria-current={path === "/" ? "page" : undefined}>
            Issues
          </a>
          <a
            href="/boards"
            aria-current={path.startsWith("/boards") ? "page" : undefined}
          >
            Boards
          </a>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
