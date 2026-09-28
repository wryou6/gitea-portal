export const DEFAULT_RETURN_TO = "/";
export const AUTH_ERROR_QUERY = "portalAuthError";

function isKnownPortalPath(path: string): boolean {
  return (
    path === "/" ||
    path === "/dashboard" ||
    path === "/issues" ||
    path === "/issues/new" ||
    path === "/issue/new" ||
    path === "/settings" ||
    path === "/kanban" ||
    path === "/gantt" ||
    /^\/issues?\/[^/]+\/[^/]+\/\d+$/.test(path) ||
    /^\/repositories\/[^/]+\/[^/]+\/(issues|kanban|gantt)$/.test(path)
  );
}

export function safePortalReturnTo(
  value: unknown,
  webOrigin: string,
): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.length > 2048
  )
    return DEFAULT_RETURN_TO;

  try {
    const origin = new URL(webOrigin).origin;
    const url = new URL(value, origin);
    const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
    if (url.origin !== origin || !isKnownPortalPath(path))
      return DEFAULT_RETURN_TO;

    url.searchParams.delete(AUTH_ERROR_QUERY);
    return `${path}${url.search}`;
  } catch {
    return DEFAULT_RETURN_TO;
  }
}

export function withAuthError(returnTo: string, error: "denied" | "failed"): string {
  const url = new URL(returnTo, "http://portal.local");
  url.searchParams.set(AUTH_ERROR_QUERY, error);
  return `${url.pathname}${url.search}`;
}
