import { useTranslation } from "react-i18next";

import { DEFAULT_LANGUAGE, matchSupportedLanguage } from "../config";
import { durationParts, formatDate, formatNumber } from "./format";

export interface Formatters {
  /** Active supported language code. */
  language: string;
  /** Localized `Sep 30, 10:30` rendering of an ISO-8601 UTC instant. */
  formatTimestamp: (iso: string) => string;
  /** Localized integer rendering (grouping separators). */
  formatNumber: (value: number) => string;
  /** Localized compact duration, e.g. `2d 1h`, `19h 30m`, `25m`. */
  formatDuration: (ms: number) => string;
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
    formatNumber: (value) => formatNumber(value, language),
    formatDuration: (ms) => {
      const { days, hours, minutes } = durationParts(ms);

      if (days > 0) return t("duration.daysHours", { days, hours });
      if (hours > 0) return t("duration.hoursMinutes", { hours, minutes });
      return t("duration.minutes", { minutes });
    },
  };
}
