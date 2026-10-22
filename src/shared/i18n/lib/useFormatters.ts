import { useTranslation } from "react-i18next";

import { DEFAULT_LANGUAGE, matchSupportedLanguage } from "../config";
import {
  durationParts,
  formatDate,
  formatNumber,
  formatPaddedNumber,
  formatPercent,
  formatShortDate,
} from "./format";

export interface Formatters {
  /** Active supported language code. */
  language: string;
  /** Localized `Sep 30, 10:30` rendering of an ISO-8601 UTC instant. */
  formatTimestamp: (iso: string) => string;
  /** Localized day-only rendering of an ISO-8601 UTC instant (`Sep 1`). */
  formatShortDate: (iso: string) => string;
  /** Localized integer rendering (grouping separators). */
  formatNumber: (value: number) => string;
  /** Localized ratio rendering (`0.625` -> `62.5%`). */
  formatPercent: (value: number) => string;
  /** Localized compact duration, e.g. `2d 1h`, `19h 30m`, `25m`. */
  formatDuration: (ms: number) => string;
  /**
   * Compact duration that keeps seconds precision below one hour, e.g.
   * `1m 42s`. Above an hour it falls back to the two most significant units
   * (`1h 12m`, `2d 1h`) like {@link Formatters.formatDuration}.
   */
  formatPreciseDuration: (ms: number) => string;
}

/**
 * Presentation formatters bound to the active language.
 *
 * This is the one place that combines `Intl` output with translated unit labels.
 * It is a React hook (not a global helper) so it stays inside react-i18next and
 * re-renders when the language changes.
 */
export function useFormatters(): Formatters {
  const { t, i18n } = useTranslation();
  const language =
    matchSupportedLanguage(i18n.resolvedLanguage ?? i18n.language) ??
    DEFAULT_LANGUAGE;

  return {
    language,
    formatTimestamp: (iso) => formatDate(iso, language),
    formatShortDate: (iso) => formatShortDate(iso, language),
    formatNumber: (value) => formatNumber(value, language),
    formatPercent: (value) => formatPercent(value, language),
    formatDuration: (ms) => {
      const { days, hours, minutes } = durationParts(ms);

      if (days > 0) return t("duration.daysHours", { days, hours });
      if (hours > 0) return t("duration.hoursMinutes", { hours, minutes });
      return t("duration.minutes", { minutes });
    },
    formatPreciseDuration: (ms) => {
      const { days, hours, minutes, seconds } = durationParts(ms);

      if (days > 0) return t("duration.daysHours", { days, hours });
      if (hours > 0) return t("duration.hoursMinutes", { hours, minutes });
      return t("duration.minutesSeconds", {
        minutes,
        seconds: formatPaddedNumber(seconds, language),
      });
    },
  };
}
