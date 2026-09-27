import {
  ISSUE_PRIORITIES,
  issuePriorityStatusFromLabels,
  type IssuePriority,
} from "@gitea-portal/domain";
import { Field, FieldLabel } from "../../components/ui/Field";
import { Select } from "../../components/ui/Select";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";

export function PriorityField({
  id,
  value,
  onChange,
  labels,
  required = true,
}: {
  id: string;
  value: IssuePriority | "";
  onChange: (value: IssuePriority | "") => void;
  labels?: readonly { name: string }[];
  required?: boolean;
}) {
  const { t } = useTranslation("issues");
  const status = labels ? issuePriorityStatusFromLabels(labels) : "valid";
  const helpId = `${id}-help`;

  return (
    <Field>
      <FieldLabel htmlFor={id}>{t("priorityLabel")}</FieldLabel>
      <Select
        id={id}
        aria-describedby={!value && status !== "valid" ? helpId : undefined}
        className={cn(
          "priority-select",
          value ? `priority-select--${value}` : "priority-select--empty",
        )}
        value={value}
        onChange={(event) => onChange(event.target.value as IssuePriority | "")}
        required={required}
      >
        <option value="">{t("choosePriority")}</option>
        {ISSUE_PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {t(`priority${priority[0]!.toUpperCase()}${priority.slice(1)}`)}
          </option>
        ))}
      </Select>
      {!value && status !== "valid" && (
        <p id={helpId} className="priority-field-help" role="status">
          {status === "missing"
            ? t("missingPriorityBeforeSave")
            : t("conflictingPriorityBeforeSave")}
        </p>
      )}
    </Field>
  );
}
