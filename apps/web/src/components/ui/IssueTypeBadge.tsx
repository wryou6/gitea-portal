import {
  ISSUE_TYPES,
  issueTypeStatusFromLabels,
  type IssueType,
} from "@gitea-portal/domain";
import { Badge } from "./Badge";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";

type IssueTypeBadgeProps = {
  type: IssueType | null;
  labels: readonly { name: string }[];
  className?: string;
};

function conflictValue(
  labelName: string,
  translate: (key: string) => string,
): string {
  const value = labelName.slice("type:".length);
  const knownType = ISSUE_TYPES.find((type) => type === value);
  if (knownType)
    return translate(`type${knownType[0]!.toUpperCase()}${knownType.slice(1)}`);
  return value || translate("blank");
}

export function IssueTypeBadge({
  type,
  labels,
  className,
}: IssueTypeBadgeProps) {
  const { t } = useTranslation("issues");
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
        {t(`type${type[0]!.toUpperCase()}${type.slice(1)}`)}
      </Badge>
    );
  }

  if (status === "missing") {
    return (
      <Badge
        className={cn("issue-type-badge issue-type-badge--missing", className)}
      >
        {t("typeMissing")}
      </Badge>
    );
  }

  const typeLabels = labels.filter((label) => label.name.startsWith("type:"));
  const conflictNames = typeLabels.map((label) => conflictValue(label.name, t));

  return (
    <span
      className={cn("issue-type-conflict", className)}
      aria-label={t("typeConflictLabel", { values: conflictNames.join("、") })}
    >
      <Badge className="issue-type-badge issue-type-badge--conflict">
        {t("typeConflict")}
      </Badge>
      <span className="issue-type-conflict-values">
        {typeLabels.map((label, index) => (
          <Badge
            className="issue-type-badge issue-type-badge--conflict-value"
            key={`${label.name}-${index}`}
          >
            {conflictValue(label.name, t)}
          </Badge>
        ))}
      </span>
    </span>
  );
}
