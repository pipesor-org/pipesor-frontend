import { useTranslation } from "react-i18next";

import { useTheme } from "../../lib/useTheme";
import { MoonIcon, SunIcon } from "../icons";

import styles from "./ThemeToggle.module.css";

export interface ThemeToggleProps {
  collapsed?: boolean;
  size?: "sm" | "md";
}

export function ThemeToggle({ collapsed = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation("common");

  const label = theme === "light" ? t("theme.switchToDark") : t("theme.switchToLight");

  return (
    <button
      type="button"
      className={`${styles.toggle}${collapsed ? ` ${styles.toggleCollapsed}` : ""}`}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {theme === "light" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
