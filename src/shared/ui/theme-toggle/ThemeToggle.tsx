import { useTranslation } from "react-i18next";

import { useTheme } from "../../lib";
import { MoonIcon, SunIcon } from "../icons";

import styles from "./ThemeToggle.module.css";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation("common");

  const label = theme === "light" ? t("theme.switchToDark") : t("theme.switchToLight");

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {theme === "light" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
