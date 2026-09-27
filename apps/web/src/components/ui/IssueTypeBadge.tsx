import {
  ISSUE_TYPES,
  issueTypeDisplayName,
  issueTypeStatusFromLabels,
  type IssueType,
} from "@gitea-portal/domain";
import { Badge } from "./Badge";
import { cn } from "../../lib/utils";

type IssueTypeBadgeProps = {
  type: IssueType | null;
  labels: readonly { name: string }[];
  className?: string;
};

function conflictValue(labelName: string): string {
  const value = labelName.slice("type:".length);
  const knownType = ISSUE_TYPES.find((type) => type === value);
  if (knownType) return issueTypeDisplayName(knownType);
  return value || "空白";
}

export function IssueTypeBadge({
  type,
  labels,
  className,
}: IssueTypeBadgeProps) {
  const status = issueTypeStatusFromLabels(labels);

  if (type) {
    return (
      <Badge
        className={cn(
          "issue-type-badge",
          `issue-type-badge--${type}`,
          className,
        )}
      >
        {issueTypeDisplayName(type)}
      </Badge>
    );
  }

  if (status === "missing") {
    return (
      <Badge
        className={cn("issue-type-badge issue-type-badge--missing", className)}
      >
        未設定
      </Badge>
    );
  }

  const typeLabels = labels.filter((label) => label.name.startsWith("type:"));
  const conflictNames = typeLabels.map((label) => conflictValue(label.name));

  return (
    <span
      className={cn("issue-type-conflict", className)}
      aria-label={`Type 衝突：${conflictNames.join("、")}`}
    >
      <Badge className="issue-type-badge issue-type-badge--conflict">
        衝突
      </Badge>
      <span className="issue-type-conflict-values">
        {typeLabels.map((label, index) => (
          <Badge
            className="issue-type-badge issue-type-badge--conflict-value"
            key={`${label.name}-${index}`}
          >
            {conflictValue(label.name)}
          </Badge>
        ))}
      </span>
    </span>
  );
}
