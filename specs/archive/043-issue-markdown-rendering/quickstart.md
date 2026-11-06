# Quickstart: Issue Markdown Rendering

## Prerequisites

- Install the existing workspace dependencies with `pnpm.cmd install`.
- Start the Portal using the repository's normal local development setup and sign in to Gitea.
- Have access to an Issue with a Markdown description and comments, or create one with headings, lists, a table, a task list, strikethrough, links, and a fenced code block.

## Validation

1. Run `pnpm.cmd typecheck` and `pnpm.cmd build` from the repository root.
2. Open the Issue directly and from a work-view Issue link; verify both full-page and dialog presentations render the description and every comment consistently.
3. Check ordinary Markdown, GFM tables/task lists/strikethrough, links, and code blocks. Confirm comment author and timestamp remain visible.
4. Check plain text, empty description, and an Issue with no comments.
5. Check raw HTML and `javascript:` links do not execute or navigate.
6. At a narrow viewport, verify long code lines and wide tables remain contained within the content area and do not cause page-level horizontal overflow.
