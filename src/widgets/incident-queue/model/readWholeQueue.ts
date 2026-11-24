/**
 * Reads a token-paged list until it ends or `cap` items are held, keeping the
 * first occurrence of each id (pages may overlap when the queue changes while
 * it is read). `truncated` tells the caller that more items exist.
 */
export async function readWholeQueue<T extends { id: string }>(
  readPage: (pageToken: string | null) => Promise<{ items: T[]; nextPageToken: string | null }>,
  cap: number,
  isCurrent: () => boolean = () => true,
): Promise<{ items: T[]; truncated: boolean } | null> {
  const byId = new Map<string, T>();
  let token: string | null = null;
  do {
    const page = await readPage(token);
    if (!isCurrent()) return null;
    for (const item of page.items) if (!byId.has(item.id)) byId.set(item.id, item);
    token = page.nextPageToken;
  } while (token && byId.size < cap);
  return { items: [...byId.values()].slice(0, cap), truncated: token !== null || byId.size > cap };
}
