import {
  issuePriorityDisplayName,
  issuePriorityStatusFromLabels,
  type IssuePriority,
} from "@gitea-portal/domain";
import { Badge } from "./Badge";
import { cn } from "../../lib/utils";

export function PriorityBadge({
  priority,
  labels,
  className,
}: {
  priority: IssuePriority | null;
  labels: readonly { name: string }[];
  className?: string;
}) {
  const status = issuePriorityStatusFromLabels(labels);

  if (priority && status === "valid") {
    return (
      <Badge
        className={cn(
          "priority-badge",
          `priority-badge--${priority}`,
          className,
        )}
      >
        {issuePriorityDisplayName(priority)}
      </Badge>
    );
  }

  if (status === "missing") {
    return (
      <Badge
        className={cn("priority-badge priority-badge--missing", className)}
      >
        未設定優先級
      </Badge>
    );
  }

  const priorityLabels = labels.filter((label) =>
    label.name.startsWith("priority:"),
  );

  return (
    <span
      className={cn("priority-conflict", className)}
      aria-label={`優先級衝突或無效：${priorityLabels
        .map((label) => label.name.slice("priority:".length) || "空白")
        .join("、")}`}
    >
      <Badge className="priority-badge priority-badge--conflict">
        優先級衝突／無效
      </Badge>
      <span className="priority-conflict-values">
        {priorityLabels.map((label, index) => (
          <Badge
            className="priority-badge priority-badge--conflict-value"
            key={`${label.name}-${index}`}
          >
            {label.name.slice("priority:".length) || "空白"}
          </Badge>
        ))}
      </span>
    </span>
  );
}
