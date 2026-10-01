import { useId, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../i18n/format";
import { useWorkViewFilterLabels } from "./work-view-filter-labels";
import type { WorkViewFilters } from "./work-view-filters";

const collapsedStorageKey = "gitea-portal:work-view-controls-collapsed";

export function WorkViewLayout({
  controls,
  children,
  filters,
  resultCount,
  repositoryFixed = false,
  pageCount = false,
  loading = false,
  error = false,
}: {
  controls: ReactNode;
  children: ReactNode;
  filters: WorkViewFilters;
  resultCount: number;
  repositoryFixed?: boolean;
  pageCount?: boolean;
  loading?: boolean;
  error?: boolean;
}) {
  const { t, i18n } = useTranslation("work-views");
  const { activeFilters, labelFor, filterHeading } = useWorkViewFilterLabels(
    filters,
    repositoryFixed,
  );
  const controlsId = useId();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const stored = window.sessionStorage.getItem(collapsedStorageKey);
      return stored === null
        ? window.matchMedia("(max-width: 720px)").matches
        : stored === "true";
    } catch {
      return window.matchMedia("(max-width: 720px)").matches;
    }
  });
  const toggleLabel = t(collapsed ? "expandControls" : "collapseControls");
  const countText = loading
    ? t("summaryLoading")
    : error
      ? t("summaryUnavailable")
      : t(pageCount ? "pageResultCount" : "resultCount", {
          count: resultCount,
          formattedCount: formatNumber(resultCount, i18n.language),
        });

  function toggleControls() {
    setCollapsed(!collapsed);
    try {
      window.sessionStorage.setItem(collapsedStorageKey, String(!collapsed));
    } catch {
      // The controls remain usable when storage is unavailable.
    }
  }

  return (
    <div
      className={`work-view-layout${collapsed ? " work-view-layout--collapsed" : ""}`}
    >
      <aside className="work-view-controls" aria-label={t("controlPanel")}>
        <div className="work-view-controls-heading">
          {!collapsed && <h2>{t("controlPanel")}</h2>}
          <button
            className="work-view-controls-toggle"
            type="button"
            aria-label={toggleLabel}
            title={toggleLabel}
            aria-expanded={!collapsed}
            aria-controls={controlsId}
            onClick={toggleControls}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={collapsed ? "m9 6 6 6-6 6" : "m15 6-6 6 6 6"} />
            </svg>
          </button>
        </div>
        <div
          id={controlsId}
          className="work-view-controls-body"
          hidden={collapsed}
        >
          {controls}
        </div>
      </aside>
      <div className="work-view-main">
        <p
          className="work-view-summary"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>{countText}</span>
          {activeFilters.length === 0 ? (
            <>
              <span aria-hidden="true"> · </span>
              <span>{t("noActiveFilters")}</span>
            </>
          ) : (
            activeFilters.map(([key, value]) => (
              <span key={key}>
                <span aria-hidden="true"> · </span>
                {filterHeading(key)}
                {i18n.resolvedLanguage === "en" ? ": " : "："}
                {labelFor(key, value)}
              </span>
            ))
          )}
        </p>
        <div className="work-view-content">{children}</div>
      </div>
    </div>
  );
}
