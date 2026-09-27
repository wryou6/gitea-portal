export function workflowStateTranslationKey(stateKey: string): string {
  switch (stateKey) {
    case "todo":
      return "workflowTodo";
    case "in-progress":
      return "workflowInProgress";
    case "done":
      return "workflowDone";
    case "open":
      return "issueOpen";
    case "closed":
      return "issueClosed";
    default:
      return "workflowAnomaly";
  }
}

export function workflowReasonTranslationKey(actionKey: string): string {
  return `reason_${actionKey.replaceAll("-", "_")}`;
}

export function workflowNextActionTranslationKey(nextActionKey: string): string {
  return `next_${nextActionKey.replaceAll("-", "_")}`;
}
