import assert from "node:assert/strict";
import { GiteaClient } from "../src/gitea/client.js";

const originalFetch = globalThis.fetch;
const pages: number[] = [];
globalThis.fetch = async (input) => {
  const page = Number(new URL(String(input)).searchParams.get("page"));
  pages.push(page);
  const labels = page === 1
    ? [{ id: 1, name: "status:todo", color: "000000" }]
    : page === 2
      ? [{ id: 2, name: "type:task", color: "000000" }]
      : [];
  return new Response(JSON.stringify(labels), { status: 200 });
};

try {
  const labels = await new GiteaClient("https://gitea.example").labels({ owner: "org", name: "repo" });
  assert.deepEqual(labels.map((label) => label.name), ["status:todo", "type:task"]);
  assert.deepEqual(pages, [1, 2, 3]);
} finally {
  globalThis.fetch = originalFetch;
}
