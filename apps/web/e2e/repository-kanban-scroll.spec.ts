import { expect, test } from "@playwright/test";

const repository = {
  owner: "pavctw",
  name: "aim-automation",
  fullName: "pavctw.protech/aim-automation",
  htmlUrl: "https://gitea.example/pavctw/aim-automation",
};

const todoTitles = [
  "定義缺漏、衝突、人工判斷與提交邊界",
  "比較文件版本保存、範本及下載方案",
  "建立 API-first 資料模型與線性版本管理",
  "實作文件上傳、解析、比對與版本提交",
  "建立機種首頁、詳情、版本比較與文件下載",
  "依確認規則產生 V2 並支援人工判斷",
  "補齊統計、設定、多語與營運需求",
];

const inProgressTitles = [
  "整理跨文件資料字典與版本判定原則",
  "盤點跨文件規則與資料保存、下載需求",
];

function createIssue(
  number: number,
  title: string,
  status: "todo" | "in-progress",
) {
  const labels = [
    { name: "priority:medium" },
    { name: "type:task" },
    { name: `status:${status}` },
  ];
  return {
    owner: repository.owner,
    name: repository.name,
    number,
    title,
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
    dueDate: "2026-11-04",
    scheduleStatus: "scheduled",
    milestone: null,
    closedAt: null,
    updatedAt: "2026-10-01T08:00:00.000Z",
    htmlUrl: `${repository.htmlUrl}/issues/${number}`,
    status,
    lastActionKey: null,
    nextAction: "開始處理",
    nextActionKey: "start-work",
  };
}

const kanbanView = {
  repository,
  columns: [
    {
      stateKey: "todo",
      displayName: "待辦",
      cards: todoTitles.map((title, index) =>
        createIssue(index + 1, title, "todo"),
      ),
    },
    {
      stateKey: "in-progress",
      displayName: "處理中",
      cards: inProgressTitles.map((title, index) =>
        createIssue(index + 8, title, "in-progress"),
      ),
    },
    { stateKey: "done", displayName: "已完成", cards: [] },
  ],
};

test("repository Kanban scrolls the same 9 real cards inside their status columns", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1520, height: 1003 });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() =>
    sessionStorage.setItem("gitea-portal:work-view-controls-collapsed", "true"),
  );

  await page.route("**/api/session", (route) =>
    route.fulfill({ json: { login: "engineer", displayName: "王冠暐" } }),
  );
  await page.route("**/api/repositories", (route) =>
    route.fulfill({ json: [repository] }),
  );
  await page.route(
    "**/api/repositories/pavctw/aim-automation/kanban",
    (route) => route.fulfill({ json: kanbanView }),
  );

  await page.goto("/repositories/pavctw/aim-automation/kanban");

  const todoCards = page.locator(".kanban-column--todo .kanban-column-cards");
  const inProgressCards = page.locator(
    ".kanban-column--in-progress .kanban-column-cards",
  );
  const lastTodoCard = page.locator(".kanban-column--todo .kanban-card").last();
  await expect(todoCards.locator(".kanban-card")).toHaveCount(7);
  await expect(inProgressCards.locator(".kanban-card")).toHaveCount(2);
  await expect(page.locator(".kanban-column--done .kanban-card")).toHaveCount(
    0,
  );

  const before = await todoCards.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    pageHeight: document.documentElement.scrollHeight,
    bodyHeight: document.body.scrollHeight,
    viewportHeight: window.innerHeight,
  }));
  expect(before.scrollHeight).toBeGreaterThan(before.clientHeight);
  expect(before.pageHeight).toBeLessThanOrEqual(before.viewportHeight);
  expect(before.bodyHeight).toBeLessThanOrEqual(before.viewportHeight);

  const bounds = await todoCards.boundingBox();
  const lastCardBeforeScroll = await lastTodoCard.boundingBox();
  const inProgressBoundsBefore = await inProgressCards.boundingBox();
  expect(bounds).not.toBeNull();
  expect(lastCardBeforeScroll).not.toBeNull();
  expect(inProgressBoundsBefore).not.toBeNull();
  expect(
    lastCardBeforeScroll!.y + lastCardBeforeScroll!.height,
  ).toBeGreaterThan(bounds!.y + bounds!.height);
  await page.mouse.move(
    bounds!.x + bounds!.width / 2,
    bounds!.y + bounds!.height / 2,
  );
  await page.mouse.wheel(0, 1400);
  await expect
    .poll(() => todoCards.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  await expect
    .poll(async () => {
      const list = await todoCards.boundingBox();
      const card = await lastTodoCard.boundingBox();
      return list && card
        ? card.y + card.height <= list.y + list.height
        : false;
    })
    .toBe(true);
  expect(await inProgressCards.evaluate((element) => element.scrollTop)).toBe(
    0,
  );
  expect((await inProgressCards.boundingBox())?.y).toBe(
    inProgressBoundsBefore!.y,
  );
  expect(await page.evaluate(() => document.documentElement.scrollTop)).toBe(0);
});
