export type PortalErrorStatus = 401 | 403 | 404 | 409 | 422 | 502;

export class PortalError extends Error {
  constructor(public readonly status: PortalErrorStatus, message: string) {
    super(message);
    this.name = 'PortalError';
  }
}
