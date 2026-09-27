import { useEffect, useState } from "react";
import { api, toUserFacingError, type Issue, type UserFacingError, type WorkflowDefinition } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { useTranslation } from "react-i18next";
import {
  workflowNextActionTranslationKey,
  workflowReasonTranslationKey,
  workflowStateTranslationKey,
} from "../../i18n/workflow";

type Assignee = { login: string; fullName?: string };

export function WorkflowTransitionDialog({
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
  const [definition, setDefinition] = useState<WorkflowDefinition>();
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [actionKey, setActionKey] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [error, setError] = useState<UserFacingError>();
  const [saving, setSaving] = useState(false);
  const actions =
    definition?.actions.filter(
      (action) =>
        action.fromState === issue.workflowState &&
        (!targetState || action.toState === targetState),
    ) ?? [];
  const selectedAction = actions.find((action) => action.key === actionKey);
  const currentStateName = t(workflowStateTranslationKey(issue.workflowState));
  const requiresAssignee =
    selectedAction?.assigneePolicy === "required-handoff" ||
    (selectedAction?.assigneePolicy === "require-if-unassigned" &&
      issue.assignees.length === 0);
  const allowsAssignee =
    requiresAssignee || selectedAction?.assigneePolicy === "optional-reviewer";

  useEffect(() => {
    let active = true;
    void Promise.all([
      api<WorkflowDefinition>("/api/workflow-definition"),
      api<Assignee[]>(
        `/api/repositories/${encodeURIComponent(issue.owner)}/${encodeURIComponent(issue.name)}/assignees`,
      ),
    ])
      .then(([workflow, repositoryAssignees]) => {
        if (!active) return;
        setDefinition(workflow);
        setAssignees(repositoryAssignees);
        const applicable = workflow.actions.filter(
          (action) =>
            action.fromState === issue.workflowState &&
            action.toState === targetState,
        );
        if (applicable.length === 1) setActionKey(applicable[0]!.key);
      })
      .catch((cause) => {
        if (active)
          setError(toUserFacingError(cause, t("workflowDefinitionLoadError")));
      });
    return () => {
      active = false;
    };
  }, [issue.name, issue.owner, issue.workflowState, targetState, t]);

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
      setError(toUserFacingError(cause, t("workflowTransitionFailed")));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open title={t("transitionDialogTitle")} onClose={onClose}>
      <p>
        {issue.title}
        {targetState
          ? ` · ${currentStateName} → ${targetState ? t(workflowStateTranslationKey(targetState)) : ""}`
          : ` · ${t("currentWorkflowState", { state: currentStateName })}`}
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
                {t(workflowReasonTranslationKey(action.key))} · {t(workflowStateTranslationKey(action.toState))} · {t("nextAction", {
                  action: t(workflowNextActionTranslationKey(action.nextActionKey)),
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
                {assignee.fullName || assignee.login}
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
