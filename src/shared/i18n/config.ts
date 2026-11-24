/**
 * Language configuration and resolution for the i18n foundation.
 *
 * i18next itself is language-agnostic; this module owns the app's policy:
 * which languages are supported, how a startup language is chosen, and how an
 * explicit choice is persisted. It deliberately avoids the
 * `i18next-browser-languagedetector` package: the resolution order is short and
 * explicit, so a small, testable function is preferable to another dependency.
 */

/** Languages the app ships translations for. `en` is first and is the fallback. */
export const SUPPORTED_LANGUAGES = ["en", "es"] as const;

/**
 * Translation namespaces. Kept small and meaningful: `common` holds app-level
 * and reusable UI copy, `operations` holds the Operations workspace copy and
 * `history`, `pipelines`, `auth` (sign-in) and `about` (the public About Pipesor area) hold their screen copy. New namespaces are added only
 * when a screen that needs them is implemented.
 */
export const namespaces = ["common", "operations", "history", "pipelines", "auth", "about"] as const;
export type Namespace = (typeof namespaces)[number];

/** Namespace used when `t()` is called without an explicit namespace. */
export const defaultNS: Namespace = "common";

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Default and fallback language for users without a recognized preference. */
export const DEFAULT_LANGUAGE: SupportedLanguage = "en";

/** Local storage key holding the user's explicitly chosen language. */
export const LANGUAGE_STORAGE_KEY = "pipesor.language";

/**
 * BCP-47 tags handed to `Intl`, kept separate from i18next's short language
 * codes so date/number formatting is explicit and deterministic instead of
 * relying on the runtime's default region for a bare code.
 */
const INTL_LOCALE_BY_LANGUAGE: Record<SupportedLanguage, string> = {
  en: "en-US",
  es: "es-ES",
};

export interface LanguageOption {
  code: SupportedLanguage;
  /**
   * Endonym (the language's own name). Language names are intentionally not
   * translated so a user can always recognize their own language.
   */
  nativeLabel: string;
}

/** Selectable languages, in display order. */
export const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  { code: "en", nativeLabel: "English" },
  { code: "es", nativeLabel: "Español" },
];

/** Narrows an arbitrary value to a supported language code. */
export function isSupportedLanguage(
  value: unknown,
): value is SupportedLanguage {
  return (
    typeof value === "string" &&
    (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
  );
}

/**
 * Maps a language tag to a supported language, accepting both bare codes
 * (`es`) and regional variants (`es-MX`, `en-GB`). Returns `undefined` when the
 * tag is not supported, so callers can keep falling back.
 */
export function matchSupportedLanguage(
  value: string | null | undefined,
): SupportedLanguage | undefined {
  if (!value) return undefined;

  const normalized = value.trim().toLowerCase();
  if (isSupportedLanguage(normalized)) return normalized;

  const [base] = normalized.split("-");
  return isSupportedLanguage(base) ? base : undefined;
}

/** Resolves the `Intl` locale tag for a (possibly unsupported) language tag. */
export function intlLocaleFor(language: string): string {
  const supported = matchSupportedLanguage(language) ?? DEFAULT_LANGUAGE;
  return INTL_LOCALE_BY_LANGUAGE[supported];
}

function readStoredLanguage(): SupportedLanguage | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    return matchSupportedLanguage(
      window.localStorage.getItem(LANGUAGE_STORAGE_KEY),
    );
  } catch {
    // Storage can throw in private/embedded contexts; treat as "no preference".
    return undefined;
  }
}

/** Persists an explicit language choice. Failure is non-fatal. */
export function persistLanguage(language: SupportedLanguage): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // The in-memory choice still applies for this session.
  }
}

/**
 * Startup language resolution, in priority order:
 *
 * 1. Explicitly saved user preference.
 * 2. First supported browser language.
 * 3. English fallback.
 */
export function resolveInitialLanguage(): SupportedLanguage {
  const stored = readStoredLanguage();
  if (stored) return stored;

  const browserLanguages =
    typeof navigator === "undefined"
      ? []
      : navigator.languages?.length
        ? navigator.languages
        : [navigator.language];

  for (const candidate of browserLanguages) {
    const match = matchSupportedLanguage(candidate);
    if (match) return match;
  }

  return DEFAULT_LANGUAGE;
}
