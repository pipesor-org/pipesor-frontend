/**
 * Public API of the `shared/i18n` slice.
 *
 * Consumers import the instance, the language policy helpers, the hooks and the
 * language selector from here. Resource catalogs and the i18next instance file
 * stay internal.
 */
export { i18n } from "./i18n";
export {
  DEFAULT_LANGUAGE,
  LANGUAGE_OPTIONS,
  SUPPORTED_LANGUAGES,
  defaultNS,
  intlLocaleFor,
  isSupportedLanguage,
  matchSupportedLanguage,
  namespaces,
  resolveInitialLanguage,
} from "./config";
export type {
  LanguageOption,
  Namespace,
  SupportedLanguage,
} from "./config";
export { useFormatters } from "./lib/useFormatters";
export type { Formatters } from "./lib/useFormatters";
export { useLanguage } from "./lib/useLanguage";
export type { UseLanguageResult } from "./lib/useLanguage";
export { LanguageSelector } from "./ui/LanguageSelector";
