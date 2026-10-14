import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import {
  DEFAULT_LANGUAGE,
  defaultNS,
  matchSupportedLanguage,
  namespaces,
  resolveInitialLanguage,
  SUPPORTED_LANGUAGES,
} from "./config";
import { resources } from "./resources";

/**
 * The single i18next instance for the app.
 *
 * Resources are bundled (no HTTP backend), so init is synchronous
 * (`initAsync: false`) and `t()` is usable immediately after this module is
 * imported. `initReactI18next` binds the instance to react-i18next, so
 * components can use `useTranslation` without a provider.
 */
const initialLanguage = resolveInitialLanguage();

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES,
  ns: namespaces,
  defaultNS,
  // Missing keys fall back to the shared namespace rather than rendering a key.
  fallbackNS: defaultNS,
  // Bundled resources: initialize synchronously.
  initAsync: false,
  // Strip region so `es-MX` resolves against the `es` catalog.
  load: "languageOnly",
  interpolation: {
    // React already escapes output.
    escapeValue: false,
  },
  react: {
    // The app does not use Suspense; render synchronously with the fallback.
    useSuspense: false,
  },
});

/** Keeps the document language in sync for assistive technology and `:lang()`. */
function applyDocumentLanguage(language: string): void {
  if (typeof document === "undefined") return;

  document.documentElement.lang =
    matchSupportedLanguage(language) ?? DEFAULT_LANGUAGE;
}

i18n.on("languageChanged", applyDocumentLanguage);
applyDocumentLanguage(initialLanguage);

export { i18n };
