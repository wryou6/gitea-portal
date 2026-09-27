import {
  ISSUE_TYPES,
  type IssueTypeStatus,
  type IssueType,
} from "@gitea-portal/domain";
import { Field, FieldLabel } from "../../components/ui/Field";
import { Select } from "../../components/ui/Select";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("issues");
  return (
    <Field>
      <FieldLabel htmlFor={id}>{t("issueType")}</FieldLabel>
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
        <option value="">{t("chooseType")}</option>
        {ISSUE_TYPES.map((type) => (
          <option key={type} value={type}>
            {t(`type${type[0]!.toUpperCase()}${type.slice(1)}`)}
          </option>
        ))}
      </Select>
      {!value && status && status !== "valid" && (
        <p className="schedule-anomaly" role="status">
          {status === "missing"
            ? t("missingTypeBeforeSave")
            : t("conflictingTypeBeforeSave")}
        </p>
      )}
    </Field>
  );
}
