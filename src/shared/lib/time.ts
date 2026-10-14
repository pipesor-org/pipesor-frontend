/**
 * Structured temporal helpers.
 *
 * Timestamps are ISO-8601 UTC strings (e.g. `2026-09-30T10:30:00Z`) and are
 * compared here so the UI never has to parse presentation strings. Locale-aware
 * *formatting* lives in `shared/i18n` (`useFormatters`); this module only works
 * with the canonical temporal values.
 */

/** Milliseconds between two ISO-8601 timestamps. */
export function durationMs(fromIso: string, toIso: string): number {
  return new Date(toIso).getTime() - new Date(fromIso).getTime();
}
