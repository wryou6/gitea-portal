import type { Issue } from "../../lib/api";
import { useTranslation } from "react-i18next";

export function IssueAssigneeRoster({ issue }: { issue: Issue }) {
  const { t } = useTranslation("issues");
  const previousHandlers = issue.currentOwner
    ? issue.assignees.filter((login) => login !== issue.currentOwner)
    : issue.assignees;
  return (
    <section className="assignee-roster" aria-label={t("issueAssignees")}>
      {issue.state === "open" && (
        <div>
          <strong>{t("currentAssignee")}</strong>
          <span>{issue.currentOwner ?? t("notAssigned")}</span>
        </div>
      )}
      <div>
        <strong>{t("previousAssignees")}</strong>
        {issue.assignees.length ? (
          <ol>
            {issue.assignees.map((login) => (
              <li key={login}>{login}</li>
            ))}
          </ol>
        ) : (
          <span>{t("noPreviousAssignees")}</span>
        )}
      </div>
      {issue.state === "open" && previousHandlers.length > 0 && (
        <small>{t("assigneeOrderSource")}</small>
      )}
    </section>
  );
}
