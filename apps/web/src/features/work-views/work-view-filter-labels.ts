import { useTranslation } from "react-i18next";
import type { WorkViewFilters } from "./work-view-filters";
import { profileFor, userDisplayName, type UserProfiles } from "../../lib/user-profiles";

export function useWorkViewFilterLabels(
  filters: WorkViewFilters,
  repositoryFixed = false,
  userProfiles?: UserProfiles,
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
    if (key === "assignee") return userDisplayName(profileFor(userProfiles, value));
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
  const activeFilters: [string, string][] = [];
  for (const [key, value] of Object.entries(filters)) {
    if (key === "repository" && repositoryFixed) continue;
    if (key === "assignee" && value === "me") continue;
    if (Array.isArray(value)) {
      for (const selected of value) activeFilters.push([key, selected]);
      continue;
    }
    if (typeof value === "string" && value !== "all" && value.trim() !== "")
      activeFilters.push([key, value]);
  }
  return { activeFilters, labelFor, filterHeading };
}
