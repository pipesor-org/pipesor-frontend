import enCommon from "./locales/en/common";
import enOperations from "./locales/en/operations";
import esCommon from "./locales/es/common";
import esOperations from "./locales/es/operations";

/**
 * Translation resources bundled with the app.
 *
 * Only the namespaces that currently have screens are included — no empty
 * catalogs for unbuilt screens. `en` is the source of truth for the typed key
 * surface (see `./i18next.d.ts`), and `es` mirrors it key-for-key.
 *
 * `as const` preserves the literal values so the i18next type augmentation can
 * derive the exact set of valid keys.
 */
export const resources = {
  en: {
    common: enCommon,
    operations: enOperations,
  },
  es: {
    common: esCommon,
    operations: esOperations,
  },
} as const;
