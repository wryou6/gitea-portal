export function issueStatusTranslationKey(statusKey: string): string {
  switch (statusKey) {
    case "todo":
      return "statusTodo";
    case "in-progress":
      return "statusInProgress";
    case "done":
      return "statusDone";
    case "open":
      return "issueOpen";
    case "closed":
      return "issueClosed";
    default:
      return "statusAnomaly";
  }
}

export function statusReasonTranslationKey(actionKey: string): string {
  return `reason_${actionKey.replaceAll("-", "_")}`;
}

export function statusNextActionTranslationKey(nextActionKey: string): string {
  return `next_${nextActionKey.replaceAll("-", "_")}`;
}
