import type { Issue } from "../../lib/api";

export function IssueAssigneeRoster({ issue }: { issue: Issue }) {
  const previousHandlers = issue.currentOwner
    ? issue.assignees.filter((login) => login !== issue.currentOwner)
    : issue.assignees;
  return (
    <section className="assignee-roster" aria-label="Issue 負責人與經手人員">
      {issue.state === "open" && (
        <div>
          <strong>目前負責人</strong>
          <span>{issue.currentOwner ?? "尚未指派"}</span>
        </div>
      )}
      <div>
        <strong>曾經手人員</strong>
        {issue.assignees.length ? (
          <ol>
            {issue.assignees.map((login) => (
              <li key={login}>{login}</li>
            ))}
          </ol>
        ) : (
          <span>尚無經手人員</span>
        )}
      </div>
      {issue.state === "open" && previousHandlers.length > 0 && (
        <small>名單順序依 Gitea Assignees 保留。</small>
      )}
    </section>
  );
}
