import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18next from "i18next";
import { useState } from "react";
import { initReactI18next, I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it } from "vitest";
import { WorkViewFilterBar } from "../src/features/work-views/WorkViewFilterBar";
import {
  createDefaultWorkViewFilters,
  serializeWorkViewFilters,
  type WorkViewFilters,
} from "../src/features/work-views/work-view-filters";
import { resources } from "../src/i18n";

afterEach(cleanup);

async function renderFilterBar(
  locale: keyof typeof resources = "zh-TW",
  initial: WorkViewFilters = createDefaultWorkViewFilters(),
  currentUserLogin?: string,
) {
  const i18n = i18next.createInstance();
  await i18n.use(initReactI18next).init({
    resources,
    lng: locale,
    fallbackLng: "zh-TW",
    defaultNS: "common",
    ns: Object.keys(resources[locale]),
    interpolation: { escapeValue: false },
    initAsync: false,
  });

  function Harness() {
    const [filters, setFilters] = useState(initial);
    return (
      <I18nextProvider i18n={i18n}>
        <WorkViewFilterBar
          filters={filters}
          onChange={setFilters}
          assignees={["a-very-long-assignee-login-for-layout-check"]}
          currentUserLogin={currentUserLogin}
        />
        <output aria-label="serialized filters">
          {serializeWorkViewFilters(filters)}
        </output>
      </I18nextProvider>
    );
  }

  return { ...render(<Harness />), i18n };
}

describe("WorkViewFilterBar component", () => {
  it("updates multi-select filters and the serialized URL state", async () => {
    const user = userEvent.setup();
    const { i18n } = await renderFilterBar("zh-TW");
    const status = screen.getByRole("group", {
      name: i18n.t("status", { ns: "issues" }),
    });
    const priority = screen.getByRole("group", {
      name: i18n.t("priorityLabel", { ns: "issues" }),
    });

    await user.click(
      within(status).getByRole("button", {
        name: i18n.t("statusTodo", { ns: "issues" }),
      }),
    );
    await user.click(
      within(status).getByRole("button", {
        name: i18n.t("statusInProgress", { ns: "issues" }),
      }),
    );
    await user.click(
      within(priority).getByRole("button", {
        name: i18n.t("priorityHigh", { ns: "issues" }),
      }),
    );

    expect(screen.getByLabelText("serialized filters").textContent).toContain(
      "state=todo",
    );
    expect(screen.getByLabelText("serialized filters").textContent).toContain(
      "state=in-progress",
    );
    expect(screen.getByLabelText("serialized filters").textContent).toContain(
      "priority=high",
    );
  });

  it("clears selected filters and exposes the all-values state", async () => {
    const user = userEvent.setup();
    const initial = {
      ...createDefaultWorkViewFilters(),
      state: ["todo"] as WorkViewFilters["state"],
      priority: ["high"] as WorkViewFilters["priority"],
    };
    const { i18n } = await renderFilterBar("zh-TW", initial);
    await user.click(
      screen.getByRole("button", {
        name: i18n.t("clearFilters", { ns: "work-views" }),
      }),
    );

    expect(screen.getByLabelText("serialized filters").textContent).toBe(
      "assignee=me",
    );
    const status = screen.getByRole("group", {
      name: i18n.t("status", { ns: "issues" }),
    });
    const allStatuses = within(status).getByRole("button", {
      name: i18n.t("allFilterValues", { ns: "work-views" }),
    });
    expect(allStatuses.getAttribute("aria-pressed")).toBe("true");
  });

  it("supports keyboard interaction, disables unavailable self-filtering, and renders in all locales", async () => {
    for (const locale of ["zh-TW", "en", "ja"] as const) {
      const user = userEvent.setup();
      const { i18n, unmount } = await renderFilterBar(locale);
      const me = screen.getByRole("button", {
        name: i18n.t("assigneeSelf", { ns: "work-views" }),
      });
      expect(me.hasAttribute("disabled")).toBe(true);

      const all = screen.getByRole("button", {
        name: i18n.t("allAssignees", { ns: "work-views" }),
      });
      all.focus();
      await user.keyboard("{Enter}");
      expect(screen.getByLabelText("serialized filters").textContent).toBe("");
      expect(
        screen.getByRole("option", {
          name: "a-very-long-assignee-login-for-layout-check",
        }).textContent,
      ).toBe("a-very-long-assignee-login-for-layout-check");
      unmount();
    }
  });
});
