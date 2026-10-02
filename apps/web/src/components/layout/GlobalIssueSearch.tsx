import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { routePaths } from "../../app/routes";
import { queryIssues, type Issue, type IssueSearchResult } from "../../lib/api";

export function GlobalIssueSearch({ returnTo, search = queryIssues, initialQuery = "" }: {
  returnTo: string;
  initialQuery?: string;
  search?: (filters: Record<string, string>) => Promise<IssueSearchResult>;
}) {
  const { t } = useTranslation("common");
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(Boolean(initialQuery.trim()));
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = "global-issue-search-results";

  useEffect(() => {
    const value = query.trim();
    setResults([]);
    setError(false);
    setActive(-1);
    if (value.length < 2) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(() => {
      void search({ q: value })
        .then((result) => { if (!cancelled) setResults(result.items.slice(0, 8)); })
        .catch(() => { if (!cancelled) setError(true); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, search]);

  function dismiss() {
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      dismiss();
      return;
    }
    if (event.key === "ArrowDown" && results.length) {
      event.preventDefault();
      setOpen(true);
      setActive((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp" && results.length) {
      event.preventDefault();
      setActive((current) => (current <= 0 ? results.length - 1 : current - 1));
    } else if (event.key === "Enter" && active >= 0 && results[active]) {
      window.location.assign(routePaths.issueDetailFrom(results[active]!.owner, results[active]!.name, results[active]!.number, returnTo));
    }
  }

  const showResults = open && query.trim().length >= 2;
  return (
    <div className="global-issue-search">
      <label className="sr-only" htmlFor="global-issue-search-input">{t("searchAllIssues")}</label>
      <input
        ref={inputRef}
        id="global-issue-search-input"
        type="search"
        role="combobox"
        aria-expanded={showResults}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        placeholder={t("searchAllIssues")}
        value={query}
        onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        onBlur={(event) => {
          if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node | null)) dismiss();
        }}
      />
      {showResults && <div id={listId} className="global-issue-search-results" role="listbox" aria-label={t("searchResults")}>
        {loading && <p role="status">{t("searchLoading")}</p>}
        {error && <p role="alert">{t("searchFailed")}</p>}
        {!loading && !error && results.length === 0 && <p>{t("searchNoResults")}</p>}
        {results.map((issue, index) => <a
          id={`${listId}-${index}`}
          key={`${issue.owner}/${issue.name}#${issue.number}`}
          role="option"
          aria-selected={index === active}
          href={routePaths.issueDetailFrom(issue.owner, issue.name, issue.number, returnTo)}
          onMouseEnter={() => setActive(index)}
        >
          <strong>{issue.title}</strong>
          <span>{issue.owner}/{issue.name} · #{issue.number}</span>
        </a>)}
      </div>}
    </div>
  );
}
