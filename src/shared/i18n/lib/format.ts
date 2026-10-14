import { intlLocaleFor } from "../config";

/**
 * Locale-aware presentation helpers built on native `Intl`.
 *
 * These format the canonical values held by the domain (ISO-8601 timestamps and
 * integers) for display only. They never parse or rewrite the underlying data,
 * and they never influence sorting or filtering, which keep using the canonical
 * values.
 */

/**
 * Formats an ISO-8601 UTC instant the way the Paper frames present it
 * (`Sep 30, 10:30`), localized per the active language.
 *
 * `timeZone: "UTC"` is deliberate: the demo snapshot's times are authored in
 * UTC and must not shift with the viewer's local time zone.
 */
export function formatDate(iso: string, language: string): string {
  return new Intl.DateTimeFormat(intlLocaleFor(language), {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** Formats an integer with the locale's grouping rules. */
export function formatNumber(value: number, language: string): string {
  return new Intl.NumberFormat(intlLocaleFor(language)).format(value);
}

export interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
}

/**
 * Decomposes a millisecond duration into whole days/hours/minutes.
 *
 * The values are canonical numbers; the caller localizes the unit labels.
 */
export function durationParts(ms: number): DurationParts {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));

  return {
    days: Math.floor(totalMinutes / 1_440),
    hours: Math.floor((totalMinutes % 1_440) / 60),
    minutes: totalMinutes % 60,
  };
}
