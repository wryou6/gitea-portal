import { Button } from "../../components/ui/Button";
import { Field, FieldLabel, Input } from "../../components/ui/Field";

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
  return (
    <div className="schedule-date-fields">
      <Field>
        <FieldLabel htmlFor={startDateId}>開始日期</FieldLabel>
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
            aria-label="清除開始日期"
            disabled={disabled || !startDate}
            onClick={() => onStartDateChange("")}
          >
            清除
          </Button>
        )}
      </Field>
      <Field>
        <FieldLabel htmlFor={dueDateId}>到期日期</FieldLabel>
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
            aria-label="清除到期日期"
            disabled={disabled || !dueDate}
            onClick={() => onDueDateChange("")}
          >
            清除
          </Button>
        )}
      </Field>
    </div>
  );
}
