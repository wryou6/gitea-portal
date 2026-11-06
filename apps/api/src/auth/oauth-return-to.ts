import { webBasePath } from "../config/web-path.js";

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

export function safePortalReturnTo(value: unknown, webOrigin: string): string {
  const webUrl = new URL(webOrigin);
  const basePath = webBasePath({ webOrigin });
  const defaultReturnTo = basePath ? `${basePath}/` : DEFAULT_RETURN_TO;
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.length > 2048
  )
    return defaultReturnTo;

  try {
    const origin = webUrl.origin;
    const url = new URL(value, origin);
    const externalPath =
      url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
    const path =
      basePath && externalPath.startsWith(`${basePath}/`)
        ? externalPath.slice(basePath.length)
        : externalPath === basePath
          ? "/"
          : externalPath;
    if (url.origin !== origin || !isKnownPortalPath(path))
      return defaultReturnTo;

    url.searchParams.delete(AUTH_ERROR_QUERY);
    return `${basePath}${path === "/" ? "/" : path}${url.search}`;
  } catch {
    return defaultReturnTo;
  }
}

export function withAuthError(
  returnTo: string,
  error: "denied" | "failed",
): string {
  const url = new URL(returnTo, "http://portal.local");
  url.searchParams.set(AUTH_ERROR_QUERY, error);
  return `${url.pathname}${url.search}`;
}
