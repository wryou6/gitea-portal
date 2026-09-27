import { Button } from "../../components/ui/Button";
import { Field, FieldLabel, Input } from "../../components/ui/Field";
import { useTranslation } from "react-i18next";

export function ScheduleDateFields({
  startDate,
  dueDate,
  startDateId,
  dueDateId,
  onStartDateChange,
  onDueDateChange,
  showClearButtons = false,
  disabled = false,
}: {
  startDate: string;
  dueDate: string;
  startDateId: string;
  dueDateId: string;
  onStartDateChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  showClearButtons?: boolean;
  disabled?: boolean;
}) {
  const { t } = useTranslation("issues");
  return (
    <div className="schedule-date-fields">
      <Field>
        <FieldLabel htmlFor={startDateId}>{t("startDate")}</FieldLabel>
        <Input
          id={startDateId}
          type="date"
          value={startDate}
          disabled={disabled}
          onChange={(event) => onStartDateChange(event.target.value)}
        />
        {showClearButtons && (
          <Button
            type="button"
            variant="ghost"
            className="schedule-date-clear"
            aria-label={t("clearStartDate")}
            disabled={disabled || !startDate}
            onClick={() => onStartDateChange("")}
          >
            {t("clear")}
          </Button>
        )}
      </Field>
      <Field>
        <FieldLabel htmlFor={dueDateId}>{t("dueDate")}</FieldLabel>
        <Input
          id={dueDateId}
          type="date"
          value={dueDate}
          disabled={disabled}
          onChange={(event) => onDueDateChange(event.target.value)}
        />
        {showClearButtons && (
          <Button
            type="button"
            variant="ghost"
            className="schedule-date-clear"
            aria-label={t("clearDueDate")}
            disabled={disabled || !dueDate}
            onClick={() => onDueDateChange("")}
          >
            {t("clear")}
          </Button>
        )}
      </Field>
    </div>
  );
}
