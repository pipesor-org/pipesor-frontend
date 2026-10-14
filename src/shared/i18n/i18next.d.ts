import type { resources } from "./resources";

/**
 * i18next type augmentation.
 *
 * Ties `t()` to the real English catalog so translation keys are checked at
 * compile time and autocompleted in the editor. The Spanish catalog is enforced
 * to mirror these keys by the resource shape, not by the type system.
 */
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: (typeof resources)["en"];
  }
}
