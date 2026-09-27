import {
  issuePriorityStatusFromLabels,
  type IssuePriority,
} from "@gitea-portal/domain";
import { Badge } from "./Badge";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";

export function PriorityBadge({
  priority,
  labels,
  className,
}: {
  priority: IssuePriority | null;
  labels: readonly { name: string }[];
  className?: string;
}) {
  const { t } = useTranslation("issues");
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
        {t(`priority${priority[0]!.toUpperCase()}${priority.slice(1)}`)}
      </Badge>
    );
  }

  if (status === "missing") {
    return (
      <Badge
        className={cn("priority-badge priority-badge--missing", className)}
      >
        {t("priorityMissing")}
      </Badge>
    );
  }

  const priorityLabels = labels.filter((label) =>
    label.name.startsWith("priority:"),
  );

  return (
    <span
      className={cn("priority-conflict", className)}
      aria-label={t("priorityConflictLabel", {
        values: priorityLabels
          .map((label) => label.name.slice("priority:".length) || t("blank"))
          .join("、"),
      })}
    >
      <Badge className="priority-badge priority-badge--conflict">
        {t("priorityConflict")}
      </Badge>
      <span className="priority-conflict-values">
        {priorityLabels.map((label, index) => (
          <Badge
            className="priority-badge priority-badge--conflict-value"
            key={`${label.name}-${index}`}
          >
            {label.name.slice("priority:".length) || t("blank")}
          </Badge>
        ))}
      </span>
    </span>
  );
}
