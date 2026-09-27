import {
  ISSUE_PRIORITIES,
  issuePriorityDisplayName,
  issuePriorityStatusFromLabels,
  type IssuePriority,
} from "@gitea-portal/domain";
import { Field, FieldLabel } from "../../components/ui/Field";
import { Select } from "../../components/ui/Select";
import { cn } from "../../lib/utils";

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
  const status = labels ? issuePriorityStatusFromLabels(labels) : "valid";
  const helpId = `${id}-help`;

  return (
    <Field>
      <FieldLabel htmlFor={id}>優先級</FieldLabel>
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
        <option value="">選擇優先級</option>
        {ISSUE_PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {issuePriorityDisplayName(priority)}
          </option>
        ))}
      </Select>
      {!value && status !== "valid" && (
        <p id={helpId} className="priority-field-help" role="status">
          {status === "missing"
            ? "Issue 尚未設定優先級，儲存前請選擇一級。"
            : "Issue 的優先級有衝突或無效標籤，請選擇一級以修正。"}
        </p>
      )}
    </Field>
  );
}
