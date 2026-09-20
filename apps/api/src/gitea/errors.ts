export class GiteaError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'GiteaError';
  }
}

export function mapGiteaError(status: number, body: string): GiteaError {
  const message = body || `Gitea request failed with status ${status}`;
  return new GiteaError(status, message);
}
