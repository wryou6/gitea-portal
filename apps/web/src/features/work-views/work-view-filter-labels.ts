import { useTranslation } from "react-i18next";
import type { WorkViewFilters } from "./work-view-filters";

export function useWorkViewFilterLabels(
  filters: WorkViewFilters,
  repositoryFixed = false,
) {
  const { t } = useTranslation(["work-views", "issues"]);
  const labelFor = (key: string, value: string): string => {
    if (key === "priority")
      return String(
        t(`priority${value[0]!.toUpperCase()}${value.slice(1)}`, {
          ns: "issues",
          defaultValue: value,
        }),
      );
    if (key === "issueType")
      return String(
        t(`type${value[0]!.toUpperCase()}${value.slice(1)}`, {
          ns: "issues",
          defaultValue: value,
        }),
      );
    if (key === "state")
      return String(
        t(
          value === "todo"
            ? "statusTodo"
            : value === "done"
              ? "statusDone"
              : "statusInProgress",
          { ns: "issues" },
        ),
      );
    if (key === "assignee" && value === "unassigned")
      return String(t("unassigned", { ns: "work-views" }));
    return value;
  };
  const filterHeading = (key: string) =>
    String(
      t(
        key === "priority"
          ? "priorityLabel"
          : key === "issueType"
            ? "type"
            : key === "state"
              ? "status"
              : key,
        { ns: "issues", defaultValue: key },
      ),
    );
  const activeFilters = Object.entries(filters).filter(
      ([key, value]) =>
        value !== "all" &&
      !(key === "assignee" && value === "me") &&
      value.trim() !== "" &&
      !(key === "repository" && repositoryFixed),
  );
  return { activeFilters, labelFor, filterHeading };
}
