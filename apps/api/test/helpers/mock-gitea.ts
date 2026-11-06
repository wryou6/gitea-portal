export type MockGiteaRequest = {
  url: string;
  init?: RequestInit;
};

export async function withMockGitea<T>(
  responder: (request: MockGiteaRequest) => Response | Promise<Response>,
  run: () => Promise<T>,
): Promise<T> {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) =>
    responder({ url: String(input), init });
  try {
    return await run();
  } finally {
    globalThis.fetch = originalFetch;
  }
}
