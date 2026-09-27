import type {
  PortalApiErrorCode,
  PortalApiErrorParams,
  PortalApiErrorResponse,
} from "@gitea-portal/domain";

export type PortalErrorStatus = 401 | 403 | 404 | 409 | 422 | 502;

export function errorCodeForStatus(status: PortalErrorStatus): PortalApiErrorCode {
  switch (status) {
    case 401:
      return "auth.required";
    case 403:
      return "permission.denied";
    case 404:
      return "resource.not_found";
    case 409:
      return "resource.conflict";
    case 422:
      return "validation.invalid_request";
    case 502:
      return "gitea.unavailable";
  }
}

export function apiErrorResponse(
  code: PortalApiErrorCode,
  error: string,
  detail?: string,
  params?: PortalApiErrorParams,
): PortalApiErrorResponse {
  return {
    error,
    code,
    ...(params ? { params } : {}),
    ...(detail ? { detail } : {}),
  };
}

export class PortalError extends Error {
  public readonly code: PortalApiErrorCode;

  constructor(
    public readonly status: PortalErrorStatus,
    message: string,
    code = errorCodeForStatus(status),
    public readonly params?: PortalApiErrorParams,
  ) {
    super(message);
    this.code = code;
    this.name = 'PortalError';
  }
}
