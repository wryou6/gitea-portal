export const PORTAL_API_ERROR_CODES = [
  "auth.required",
  "auth.csrf_failed",
  "auth.oauth_code_required",
  "auth.oauth_login_failed",
  "permission.denied",
  "resource.not_found",
  "resource.conflict",
  "validation.invalid_request",
  "gitea.unavailable",
  "server.internal_error",
] as const;

export type PortalApiErrorCode = (typeof PORTAL_API_ERROR_CODES)[number];
export type PortalApiErrorParams = Record<string, string | number | boolean>;

export type PortalApiErrorResponse = {
  error: string;
  code: PortalApiErrorCode;
  params?: PortalApiErrorParams;
  detail?: string;
};

export function isPortalApiErrorCode(value: unknown): value is PortalApiErrorCode {
  return (
    typeof value === "string" &&
    PORTAL_API_ERROR_CODES.some((code) => code === value)
  );
}
