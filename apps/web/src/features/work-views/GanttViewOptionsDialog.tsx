import { useTranslation } from "react-i18next";
import { Checkbox } from "../../components/ui/Checkbox";
import { Dialog } from "../../components/ui/Dialog";
import type { IssueSortField } from "../../lib/api";
import {
  GANTT_FIXED_FIELDS,
  GANTT_VIEW_FIELDS,
  type GanttViewPreference,
} from "./gantt-view-preference";

export function GanttViewOptionsDialog({
  open,
  preference,
  onClose,
  onChange,
}: {
  open: boolean;
  preference: GanttViewPreference;
  onClose: () => void;
  onChange: (preference: GanttViewPreference) => void;
}) {
  const { t } = useTranslation("work-views");
  const { t: tIssues } = useTranslation("issues");

  function label(field: IssueSortField): string {
    return tIssues(field === "priority" ? "priorityLabel" : field);
  }

  return (
    <Dialog
      open={open}
      title={t("ganttViewOptions")}
      onClose={onClose}
      className="gantt-view-options-shell"
    >
      <div className="gantt-view-options-dialog">
        <section aria-labelledby="gantt-view-options-heading">
          <h3 id="gantt-view-options-heading">{t("ganttVisibleColumns")}</h3>
          <p className="muted">{t("ganttVisibleColumnsHelp")}</p>
          <div className="gantt-view-option-list">
            {GANTT_VIEW_FIELDS.map((field) => {
              const fixed = GANTT_FIXED_FIELDS.includes(field);
              const checked = preference.visibleFields.includes(field);
              return (
                <label className="gantt-view-option" key={field}>
                  <Checkbox
                    checked={checked}
                    disabled={fixed}
                    onChange={(event) => {
                      const visibleFields = event.target.checked
                        ? [...preference.visibleFields, field]
                        : preference.visibleFields.filter((visible) => visible !== field);
                      onChange({ ...preference, visibleFields });
                    }}
                  />
                  <span>{label(field)}</span>
                  {fixed && <span className="muted">{t("ganttFixedColumn")}</span>}
                </label>
              );
            })}
          </div>
        </section>
      </div>
    </Dialog>
  );
}
