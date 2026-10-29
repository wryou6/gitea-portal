import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

test("single repository Kanban scrolls cards inside the status column", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const assetDirectory = join(import.meta.dirname, "../dist/assets");
  const cssFile = readdirSync(assetDirectory).find((file) => file.endsWith(".css"));
  expect(cssFile, "production CSS bundle should exist; test:e2e builds it first").toBeDefined();

  await page.setContent(`
      <style>${readFileSync(join(assetDirectory, cssFile!), "utf8")}</style>
      <div class="app-content" style="height: 600px; width: 1000px">
        <section>
          <section class="workspace-view">
            <header class="page-heading">Repository Kanban</header>
            <div class="work-view-layout">
              <aside class="work-view-controls"></aside>
              <main class="work-view-main">
                <div class="work-view-content">
                  <div class="kanban-board">
                    <section class="kanban-column">
                      <h2>Todo <span class="kanban-column-count">40</span></h2>
                      <div class="kanban-column-cards" tabindex="0">
                        ${Array.from({ length: 40 }, (_, i) => `<article class="kanban-card" style="height: 80px">Issue ${i + 1}</article>`).join("")}
                      </div>
                    </section>
                  </div>
                </div>
              </main>
            </div>
          </section>
        </section>
      </div>`);

  const cards = page.locator(".kanban-column-cards");
  await expect(cards).toBeVisible();
  const before = await cards.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    pageHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
  }));
  expect(before.scrollHeight).toBeGreaterThan(before.clientHeight);
  expect(before.pageHeight).toBeLessThanOrEqual(before.viewportHeight);

  await cards.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await expect.poll(() => cards.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollTop)).toBe(0);
});
