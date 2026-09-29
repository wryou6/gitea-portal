import { useTranslation } from "react-i18next";
import { Checkbox } from "../../components/ui/Checkbox";
import { Dialog } from "../../components/ui/Dialog";
import { ISSUE_VIEW_FIELDS, type IssueViewPreference } from "./issue-view-preference";

export function IssueViewOptionsDialog({
  open,
  preference,
  onClose,
  onChange,
}: {
  open: boolean;
  preference: IssueViewPreference;
  onClose: () => void;
  onChange: (preference: IssueViewPreference) => void;
}) {
  const { t } = useTranslation("issues");

  function update(next: Partial<IssueViewPreference>) {
    onChange({ ...preference, ...next });
  }

  function label(field: (typeof ISSUE_VIEW_FIELDS)[number]): string {
    return t(field === "priority" ? "priorityLabel" : field);
  }

  return (
    <Dialog open={open} title={t("viewOptions")} onClose={onClose} className="issue-view-options-shell">
      <div className="issue-view-options-dialog">
        <section aria-labelledby="issue-view-section-heading">
          <h3 id="issue-view-section-heading">{t("visibleProperties")}</h3>
          <p className="muted">{t("visiblePropertiesHelp")}</p>
          <div className="issue-view-option-list">
            {preference.columnOrder.map((field) => {
              const fixed = field === "key" || field === "title";
              const checked = preference.visibleFields.includes(field);
              return (
                <label className="issue-view-option" key={field}>
                  <Checkbox
                    checked={checked}
                    disabled={fixed}
                    onChange={(event) => {
                      const visibleFields = event.target.checked
                        ? [...preference.visibleFields, field]
                        : preference.visibleFields.filter((visible) => visible !== field);
                      update({ visibleFields });
                    }}
                  />
                  <span>{label(field)}</span>
                  {fixed && <span className="muted">{t("alwaysVisible")}</span>}
                </label>
              );
            })}
          </div>
        </section>
      </div>
    </Dialog>
  );
}
