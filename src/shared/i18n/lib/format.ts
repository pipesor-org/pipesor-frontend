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

/**
 * Formats an ISO-8601 UTC instant as a day only (`Sep 1`, `1 sept`).
 *
 * Used where a period boundary is displayed without a time of day, such as the
 * History — Insights weekly axis. Time zone handling matches {@link formatDate}:
 * the demo instants are authored in UTC and must not shift.
 */
export function formatShortDate(iso: string, language: string): string {
  return new Intl.DateTimeFormat(intlLocaleFor(language), {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** Formats an integer with the locale's grouping rules. */
export function formatNumber(value: number, language: string): string {
  return new Intl.NumberFormat(intlLocaleFor(language)).format(value);
}

/**
 * Formats a ratio (`0.625`) as a localized percentage (`62.5%`).
 *
 * At most one fraction digit is kept, so whole percentages stay short (`84%`)
 * while small denominators are not rounded into a misleading total: the
 * Insights demo has eight validated diagnoses, where integer rounding would
 * render `63%` and `38%` (101%). Callers pass a canonical ratio, never a
 * display string.
 */
export function formatPercent(value: number, language: string): string {
  return new Intl.NumberFormat(intlLocaleFor(language), {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

export interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
  /** Additive: existing callers may keep using day/hour/minute granularity. */
  seconds: number;
}

/**
 * Decomposes a millisecond duration into whole days/hours/minutes/seconds.
 *
 * The values are canonical numbers; the caller localizes the unit labels.
 */
export function durationParts(ms: number): DurationParts {
  const totalSeconds = Math.max(0, Math.floor(ms / 1_000));

  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
  };
}

/**
 * Formats an integer with at least two digits (e.g. `5` -> `05`).
 *
 * Used for the seconds component of a duration, which the History frames
 * present zero-padded (`1m 42s`, `3m 05s`). Locale-aware so the digits follow
 * the active language's numbering system.
 */
export function formatPaddedNumber(value: number, language: string): string {
  return new Intl.NumberFormat(intlLocaleFor(language), {
    minimumIntegerDigits: 2,
    useGrouping: false,
  }).format(value);
}
