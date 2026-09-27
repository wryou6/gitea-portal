import {
  ISSUE_TYPES,
  issueTypeDisplayName,
  type IssueTypeStatus,
  type IssueType,
} from "@gitea-portal/domain";
import { Field, FieldLabel } from "../../components/ui/Field";
import { Select } from "../../components/ui/Select";
import { cn } from "../../lib/utils";

export function IssueTypeField({
  id,
  value,
  onChange,
  required = true,
  status,
}: {
  id: string;
  value: IssueType | "";
  onChange: (value: IssueType | "") => void;
  required?: boolean;
  status?: IssueTypeStatus;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Issue Type</FieldLabel>
      <Select
        id={id}
        className={cn(
          "issue-type-select",
          value ? `issue-type-select--${value}` : "issue-type-select--empty",
        )}
        value={value}
        onChange={(event) => onChange(event.target.value as IssueType | "")}
        required={required}
      >
        <option value="">選擇類型</option>
        {ISSUE_TYPES.map((type) => (
          <option key={type} value={type}>
            {issueTypeDisplayName(type)}
          </option>
        ))}
      </Select>
      {!value && status && status !== "valid" && (
        <p className="schedule-anomaly" role="status">
          {status === "missing"
            ? "Issue 尚未設定 Type，儲存前請選擇一種。"
            : "Issue 的 Type 有衝突，請選擇一種以修正。"}
        </p>
      )}
    </Field>
  );
}
