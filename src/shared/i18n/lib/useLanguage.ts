import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_OPTIONS,
  matchSupportedLanguage,
  persistLanguage,
  type LanguageOption,
  type SupportedLanguage,
} from "../config";

export interface UseLanguageResult {
  /** Currently active supported language. */
  language: SupportedLanguage;
  /** Selectable languages, in display order. */
  options: readonly LanguageOption[];
  /** Switches language and persists the explicit choice. */
  setLanguage: (language: SupportedLanguage) => void;
}

/**
 * Reads and switches the active language.
 *
 * Persistence happens here — and only here — so that an *explicit* user choice
 * is remembered. An auto-detected browser language is intentionally not saved,
 * so a change to the browser preference is still honored on the next visit.
 */
export function useLanguage(): UseLanguageResult {
  const { i18n } = useTranslation();
  const language =
    matchSupportedLanguage(i18n.resolvedLanguage ?? i18n.language) ??
    DEFAULT_LANGUAGE;

  const setLanguage = useCallback(
    (next: SupportedLanguage) => {
      persistLanguage(next);
      void i18n.changeLanguage(next);
    },
    [i18n],
  );

  return { language, options: LANGUAGE_OPTIONS, setLanguage };
}
