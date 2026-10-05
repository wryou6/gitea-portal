import { useEffect, useId, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../i18n/format";
import { useWorkViewFilterLabels } from "./work-view-filter-labels";
import type { WorkViewFilters } from "./work-view-filters";
import type { UserProfiles } from "../../lib/user-profiles";

const collapsedStorageKey = "gitea-portal:work-view-controls-collapsed";

export function WorkViewLayout({
  controls,
  commonFilters,
  collapseCommonFiltersOnMobile = false,
  children,
  filters,
  resultCount,
  recentDoneOnly = true,
  repositoryFixed = false,
  loading = false,
  error = false,
  userProfiles,
}: {
  controls: ReactNode;
  commonFilters?: ReactNode;
  collapseCommonFiltersOnMobile?: boolean;
  children: ReactNode;
  filters: WorkViewFilters;
  resultCount: number;
  recentDoneOnly?: boolean;
  repositoryFixed?: boolean;
  loading?: boolean;
  error?: boolean;
  userProfiles?: UserProfiles;
}) {
  const { t, i18n } = useTranslation("work-views");
  const { activeFilters, labelFor, filterHeading } = useWorkViewFilterLabels(
    filters,
    repositoryFixed,
    userProfiles,
  );
  const controlsId = useId();
  const commonFiltersId = useId();
  const [isMobileViewport, setIsMobileViewport] = useState(
    () => window.matchMedia("(max-width: 720px)").matches,
  );
  const [mobileFiltersCollapsed, setMobileFiltersCollapsed] = useState(
    () => window.matchMedia("(max-width: 720px)").matches,
  );
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
  useEffect(() => {
    if (!collapseCommonFiltersOnMobile) return;
    const media = window.matchMedia("(max-width: 720px)");
    const updateViewport = () => {
      setIsMobileViewport(media.matches);
      setMobileFiltersCollapsed(media.matches);
    };
    media.addEventListener("change", updateViewport);
    updateViewport();
    return () => media.removeEventListener("change", updateViewport);
  }, [collapseCommonFiltersOnMobile]);
  const toggleLabel = t(collapsed ? "expandControls" : "collapseControls");
  const countText = loading
    ? t("summaryLoading")
    : error
      ? t("summaryUnavailable")
      : t("resultCount", {
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
        {commonFilters && (
          <>
            {collapseCommonFiltersOnMobile && (
              <button
                className="work-view-mobile-filter-toggle"
                type="button"
                aria-expanded={!isMobileViewport || !mobileFiltersCollapsed}
                aria-controls={commonFiltersId}
                onClick={() => setMobileFiltersCollapsed((value) => !value)}
              >
                {t(
                  mobileFiltersCollapsed
                    ? "expandMobileFilters"
                    : "collapseMobileFilters",
                )}
              </button>
            )}
            <div
              id={commonFiltersId}
              className="work-view-common-filters"
              hidden={
                collapseCommonFiltersOnMobile &&
                isMobileViewport &&
                mobileFiltersCollapsed
              }
            >
              {commonFilters}
            </div>
          </>
        )}
        <p
          className="work-view-summary"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>{countText}</span>
          {recentDoneOnly && <span><span aria-hidden="true"> · </span>{t("recentDoneSummary")}</span>}
          {activeFilters.length === 0 && !recentDoneOnly ? (
            <>
              <span aria-hidden="true"> · </span>
              <span>{t("noActiveFilters")}</span>
            </>
          ) : (
            activeFilters.map(([key, value]) => (
              <span key={`${key}:${value}`}>
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
