import { z } from "zod";

/**
 * `?pageSize=&pageToken=` list envelope from the MVP HTTP API: `items` plus an
 * opaque, nullable `nextPageToken`.
 */
export function tokenPageSchema<T extends z.ZodType>(item: T) {
  return z.object({ items: z.array(item), nextPageToken: z.string().min(1).nullish() });
}

/** Legacy `?offset=&limit=` envelope still used by some Pipeline lists. */
export function offsetPageSchema<T extends z.ZodType>(item: T) {
  return z.object({ items: z.array(item), offset: z.number().int(), limit: z.number().int() });
}

/** Default page size of the MVP HTTP API. */
export const DEFAULT_PAGE_SIZE = 24;
