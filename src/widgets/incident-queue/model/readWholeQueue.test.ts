import { describe, expect, test } from "bun:test";

import { readWholeQueue } from "./readWholeQueue";

type Item = { id: string };

/** A paged list of `count` items served `size` at a time. */
function pages(count: number, size: number) {
  const items = Array.from({ length: count }, (_, index) => ({ id: `i${index}` }));
  const reads: (string | null)[] = [];
  const readPage = async (token: string | null) => {
    reads.push(token);
    const start = token ? Number(token) : 0;
    const end = Math.min(start + size, count);
    return { items: items.slice(start, end), nextPageToken: end < count ? String(end) : null };
  };
  return { readPage, reads };
}

describe("reading the whole queue for browser-side filtering", () => {
  test("reads every page of a queue below the cap", async () => {
    const queue = pages(250, 100);
    const result = await readWholeQueue<Item>(queue.readPage, 500);
    expect(result?.items).toHaveLength(250);
    expect(result?.truncated).toBe(false);
    expect(queue.reads).toEqual([null, "100", "200"]);
  });

  test("stops at the cap and says more exist", async () => {
    const queue = pages(730, 100);
    const result = await readWholeQueue<Item>(queue.readPage, 500);
    expect(result?.items).toHaveLength(500);
    expect(result?.truncated).toBe(true);
    expect(queue.reads).toHaveLength(5);
  });

  test("a queue of exactly the cap is complete", async () => {
    const result = await readWholeQueue<Item>(pages(500, 100).readPage, 500);
    expect(result?.truncated).toBe(false);
  });

  test("keeps the first occurrence when pages overlap", async () => {
    const readPage = async (token: string | null) =>
      token
        ? { items: [{ id: "b", n: 2 }, { id: "c", n: 3 }], nextPageToken: null }
        : { items: [{ id: "a", n: 1 }, { id: "b", n: 1 }], nextPageToken: "2" };
    const result = await readWholeQueue(readPage, 500);
    expect(result?.items).toEqual([{ id: "a", n: 1 }, { id: "b", n: 1 }, { id: "c", n: 3 }]);
  });

  test("a superseded read returns nothing", async () => {
    let current = true;
    const queue = pages(250, 100);
    const read = async (token: string | null) => {
      const page = await queue.readPage(token);
      current = false;
      return page;
    };
    expect(await readWholeQueue<Item>(read, 500, () => current)).toBeNull();
    expect(queue.reads).toEqual([null]);
  });
});
