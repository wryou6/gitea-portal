import { expect, test, type Page } from "@playwright/test";

const repository = {
  owner: "owner",
  name: "repo",
  fullName: "owner/repo",
  htmlUrl: "https://gitea.example/owner/repo",
};

function issue(status: "todo" | "in-progress") {
  const labels = [
    { name: "priority:medium" },
    { name: "type:task" },
    { name: `status:${status}` },
    ...(status === "in-progress" ? [{ name: "status-action:start-work" }] : []),
  ];
  return {
    owner: repository.owner,
    name: repository.name,
    number: 1,
    title: "Transition verification issue",
    author: "engineer",
    createdAt: "2026-10-01T08:00:00.000Z",
    state: "open",
    type: "task",
    priority: "medium",
    assignee: "engineer",
    assignees: ["engineer"],
    currentOwner: "engineer",
    labels,
    visibleLabels: labels,
    startDate: null,
    dueDate: null,
    scheduleStatus: "unscheduled",
    milestone: null,
    closedAt: null,
    updatedAt:
      status === "todo"
        ? "2026-10-01T08:00:00.000Z"
        : "2026-10-02T08:00:00.000Z",
    htmlUrl: `${repository.htmlUrl}/issues/1`,
    status,
    lastActionKey: status === "todo" ? null : "start-work",
    nextAction: status === "todo" ? "開始處理" : "開始實作",
    nextActionKey: status === "todo" ? "begin-work" : "implement",
  };
}

function kanbanView(status: "todo" | "in-progress") {
  const card = issue(status);
  return {
    repository,
    columns: [
      {
        stateKey: "todo",
        displayName: "待辦",
        cards: status === "todo" ? [card] : [],
      },
      {
        stateKey: "in-progress",
        displayName: "處理中",
        cards: status === "in-progress" ? [card] : [],
      },
      { stateKey: "done", displayName: "已完成", cards: [] },
    ],
  };
}

const statusDefinition = {
  states: [
    { key: "todo", labelName: "status:todo", displayName: "待辦" },
    {
      key: "in-progress",
      labelName: "status:in-progress",
      displayName: "處理中",
    },
  ],
  actions: [
    {
      key: "start-work",
      fromState: "todo",
      toState: "in-progress",
      reasonLabel: "開始處理",
      nextAction: "開始實作",
      nextActionKey: "implement",
      assigneePolicy: "require-if-unassigned",
      labelName: "status-action:start-work",
    },
  ],
};

async function openBoard(
  page: Page,
  transitionStatus: number,
) {
  let currentStatus: "todo" | "in-progress" = "todo";
  await page.addInitScript(() =>
    sessionStorage.setItem("gitea-portal:work-view-controls-collapsed", "true"),
  );
  await page.route("**/api/session", (route) =>
    route.fulfill({ json: { login: "engineer", displayName: "Engineer" } }),
  );
  await page.route("**/api/repositories", (route) =>
    route.fulfill({ json: [repository] }),
  );
  await page.route("**/api/status-definition", (route) =>
    route.fulfill({ json: statusDefinition }),
  );
  await page.route("**/api/repositories/owner/repo/assignees", (route) =>
    route.fulfill({ json: [] }),
  );
  await page.route("**/api/repositories/owner/repo/kanban", (route) =>
    route.fulfill({ json: kanbanView(currentStatus) }),
  );
  await page.route("**/api/issues/owner/repo/1/transition", async (route) => {
    if (transitionStatus === 200) {
      currentStatus = "in-progress";
      await route.fulfill({ json: issue(currentStatus) });
      return;
    }
    await route.fulfill({
      status: transitionStatus,
      json: {
        code:
          transitionStatus === 403
            ? "permission.denied"
            : "resource.conflict",
        error: transitionStatus === 403 ? "Permission denied" : "Conflict",
      },
    });
  });

  await page.goto("/repositories/owner/repo/kanban");
  await expect(
    page.locator(".kanban-column--todo .kanban-card"),
  ).toHaveCount(1);
}

async function dragIntoProgress(page: Page) {
  await page
    .locator(".kanban-column--todo .kanban-card")
    .dragTo(page.locator(".kanban-column--in-progress .kanban-column-cards"));
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("button", { name: /Confirm transition|確認轉換/ })
    .click();
}

for (const status of [200, 403, 409] as const) {
  test(`Kanban status transition handles HTTP ${status}`, async ({ page }) => {
    await openBoard(page, status);
    await dragIntoProgress(page);

    if (status === 200) {
      await expect(
        page.locator(".kanban-column--in-progress .kanban-card"),
      ).toContainText("Transition verification issue");
      await expect(
        page.locator(".kanban-column--todo .kanban-card"),
      ).toHaveCount(0);
    } else {
      await expect(
        page.getByRole("dialog").getByRole("alert"),
      ).toBeVisible();
      await expect(
        page.locator(".kanban-column--todo .kanban-card"),
      ).toContainText("Transition verification issue");
      await expect(
        page.locator(".kanban-column--in-progress .kanban-card"),
      ).toHaveCount(0);
    }
  });
}
