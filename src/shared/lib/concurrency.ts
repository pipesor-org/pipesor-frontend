/**
 * Runs `task` for every item with at most `limit` in flight, so a page of rows
 * does not open dozens of simultaneous requests. Settles when all tasks have;
 * individual failures are the task's responsibility.
 */
export async function forEachWithConcurrency<T>(items: readonly T[], limit: number, task: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++];
      await task(item);
    }
  });
  await Promise.all(workers);
}
