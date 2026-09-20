export function validateIssueCreate(input: unknown): asserts input is { title: string; body?: string; assignee?: string | null; labels?: string[]; milestone?: string | null } {
  const value = input as { title?: unknown };
  if (typeof value?.title !== 'string' || !value.title.trim()) throw new Error('Issue title is required');
}

export function validateComment(body: unknown): string {
  if (typeof body !== 'string' || !body.trim()) throw new Error('Comment body is required');
  return body.trim();
}
