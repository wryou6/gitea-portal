import { useEffect, useState } from "react";
import { api, toUserFacingError, type Issue, type UserFacingError, type StatusDefinition } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { useTranslation } from "react-i18next";
import {
  statusNextActionTranslationKey,
  statusReasonTranslationKey,
  issueStatusTranslationKey,
} from "../../i18n/status";

type Assignee = { login: string; fullName?: string; avatarUrl?: string };

export function StatusTransitionDialog({
  issue,
  targetState,
  onClose,
  onSubmit,
}: {
  issue: Issue;
  targetState?: string;
  onClose: () => void;
  onSubmit: (actionKey: string, selectedAssignee?: string) => Promise<void>;
}) {
  const { t } = useTranslation("issues");
  const [definition, setDefinition] = useState<StatusDefinition>();
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [actionKey, setActionKey] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [error, setError] = useState<UserFacingError>();
  const [saving, setSaving] = useState(false);
  const actions =
    definition?.actions.filter(
      (action) =>
        action.fromState === issue.status &&
        (!targetState || action.toState === targetState),
    ) ?? [];
  const selectedAction = actions.find((action) => action.key === actionKey);
  const currentStatusName = t(issueStatusTranslationKey(issue.status));
  const requiresAssignee =
    selectedAction?.assigneePolicy === "required-handoff" ||
    (selectedAction?.assigneePolicy === "require-if-unassigned" &&
      issue.assignees.length === 0);
  const allowsAssignee =
    requiresAssignee || selectedAction?.assigneePolicy === "optional-reviewer";

  useEffect(() => {
    let active = true;
    void Promise.all([
      api<StatusDefinition>("/api/status-definition"),
      api<Assignee[]>(
        `/api/repositories/${encodeURIComponent(issue.owner)}/${encodeURIComponent(issue.name)}/assignees`,
      ),
    ])
      .then(([statusDefinition, repositoryAssignees]) => {
        if (!active) return;
        setDefinition(statusDefinition);
        setAssignees(repositoryAssignees);
        const applicable = statusDefinition.actions.filter(
          (action) =>
            action.fromState === issue.status &&
            action.toState === targetState,
        );
        if (applicable.length === 1) setActionKey(applicable[0]!.key);
      })
      .catch((cause) => {
        if (active)
          setError(toUserFacingError(cause, t("statusDefinitionLoadError")));
      });
    return () => {
      active = false;
    };
  }, [issue.name, issue.owner, issue.status, targetState, t]);

  const submit = async () => {
    if (!selectedAction || (requiresAssignee && !selectedAssignee)) {
      setError(
        requiresAssignee
          ? t("selectedActionRequiresAssignee")
          : t("chooseTransitionReason"),
      );
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await onSubmit(selectedAction.key, selectedAssignee || undefined);
      onClose();
    } catch (cause) {
      setError(toUserFacingError(cause, t("statusTransitionFailed")));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open title={t("transitionDialogTitle")} onClose={onClose}>
      <p>
        {issue.title}
        {targetState
          ? ` · ${currentStatusName} → ${targetState ? t(issueStatusTranslationKey(targetState)) : ""}`
          : ` · ${t("currentIssueStatus", { status: currentStatusName })}`}
      </p>
      {actions.length ? (
        <label className="field">
          <span>{t("transitionReason")}</span>
          <select
            value={actionKey}
            onChange={(event) => {
              setActionKey(event.target.value);
              setSelectedAssignee("");
              setError(undefined);
            }}
          >
            <option value="">{t("chooseReason")}</option>
            {actions.map((action) => (
              <option key={action.key} value={action.key}>
                {t(statusReasonTranslationKey(action.key))} · {t(issueStatusTranslationKey(action.toState))} · {t("nextAction", {
                  action: t(statusNextActionTranslationKey(action.nextActionKey)),
                })}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p>{t("noTransitionReasons")}</p>
      )}
      {allowsAssignee && (
        <label className="field">
          <span>{requiresAssignee ? t("nextAssignee") : t("optionalReviewer")}</span>
          <select
            value={selectedAssignee}
            onChange={(event) => setSelectedAssignee(event.target.value)}
          >
            <option value="">
              {requiresAssignee ? t("choosePerson") : t("keepCurrentAssignees")}
            </option>
            {assignees.map((assignee) => (
              <option key={assignee.login} value={assignee.login}>
                {assignee.fullName?.trim() ? `${assignee.fullName.trim()} (${assignee.login})` : assignee.login}
              </option>
            ))}
          </select>
        </label>
      )}
      {error && <ErrorNotice message={error} />}
      <div className="actions">
        <Button
          type="button"
          disabled={saving || !selectedAction}
          onClick={() => void submit()}
        >
          {saving ? t("saving") : t("confirmTransition")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={saving}
          onClick={onClose}
        >
          {t("cancel")}
        </Button>
      </div>
    </Dialog>
  );
}
