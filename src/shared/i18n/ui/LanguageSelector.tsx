import { useTranslation } from "react-i18next";

import { useLanguage } from "../lib/useLanguage";

import styles from "./LanguageSelector.module.css";

const LABEL_ID = "language-selector-label";

/**
 * Compact language switcher: a labelled pair of toggle buttons.
 *
 * Uses `aria-pressed` (rather than a `<select>`) so the active language is
 * exposed unambiguously and the control matches the segmented controls already
 * used in the app. Each button is reachable by keyboard and shows its own
 * language name as the accessible label. `labelHidden` keeps the label for
 * assistive technology only, where the surrounding form already shows one.
 */
export function LanguageSelector({ labelHidden = false }: { labelHidden?: boolean }) {
  const { t } = useTranslation("common");
  const { language, options, setLanguage } = useLanguage();

  return (
    <div className={styles.root}>
      <span className={labelHidden ? styles.srOnly : styles.label} id={LABEL_ID}>
        {t("language.label")}
      </span>

      <div
        className={styles.options}
        role="group"
        aria-labelledby={LABEL_ID}
      >
        {options.map((option) => {
          const isActive = option.code === language;

          return (
            <button
              key={option.code}
              type="button"
              className={`${styles.option}${isActive ? ` ${styles.optionActive}` : ""}`}
              aria-pressed={isActive}
              aria-label={option.nativeLabel}
              onClick={() => setLanguage(option.code)}
            >
              {option.code.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
