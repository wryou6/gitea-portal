import { useEffect, useState } from "react";
import { api, type Issue, type WorkflowDefinition } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";

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
  const [definition, setDefinition] = useState<WorkflowDefinition>();
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [actionKey, setActionKey] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const actions =
    definition?.actions.filter(
      (action) =>
        action.fromState === issue.workflowState &&
        (!targetState || action.toState === targetState),
    ) ?? [];
  const selectedAction = actions.find((action) => action.key === actionKey);
  const currentStateName =
    definition?.states.find((state) => state.key === issue.workflowState)
      ?.displayName ?? stateName(issue.workflowState);
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
          setError(cause instanceof Error ? cause.message : "無法載入轉換選項");
      });
    return () => {
      active = false;
    };
  }, [issue.name, issue.owner, issue.workflowState, targetState]);

  const submit = async () => {
    if (!selectedAction || (requiresAssignee && !selectedAssignee)) {
      setError(
        requiresAssignee ? "此動作需要指定下一位負責人" : "請選擇轉換原因",
      );
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await onSubmit(selectedAction.key, selectedAssignee || undefined);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "狀態轉換失敗");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open title="選擇狀態轉換原因" onClose={onClose}>
      <p>
        {issue.title}
        {targetState
          ? ` · ${currentStateName} → ${definition?.states.find((state) => state.key === targetState)?.displayName ?? stateName(targetState)}`
          : ` · 目前狀態：${currentStateName}`}
      </p>
      {actions.length ? (
        <label className="field">
          <span>轉換原因</span>
          <select
            value={actionKey}
            onChange={(event) => {
              setActionKey(event.target.value);
              setSelectedAssignee("");
              setError(undefined);
            }}
          >
            <option value="">選擇原因</option>
            {actions.map((action) => (
              <option key={action.key} value={action.key}>
                {action.reasonLabel} ·{" "}
                {definition?.states.find(
                  (state) => state.key === action.toState,
                )?.displayName ?? stateName(action.toState)}{" "}
                · 下一步：
                {action.nextAction}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p>目前狀態沒有可用的轉換原因。</p>
      )}
      {allowsAssignee && (
        <label className="field">
          <span>{requiresAssignee ? "下一位負責人" : "審查者（選填）"}</span>
          <select
            value={selectedAssignee}
            onChange={(event) => setSelectedAssignee(event.target.value)}
          >
            <option value="">
              {requiresAssignee ? "選擇人員" : "保留目前名單"}
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
          {saving ? "儲存中…" : "確認轉換"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={saving}
          onClick={onClose}
        >
          取消
        </Button>
      </div>
    </Dialog>
  );
}

function stateName(key: string): string {
  return key === "todo"
    ? "待辦"
    : key === "in-progress"
      ? "處理中"
      : key === "done"
        ? "已完成"
        : "狀態異常";
}
