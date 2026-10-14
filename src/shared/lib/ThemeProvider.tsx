import { useCallback, useEffect, useState, type ReactNode } from "react";

import {
  applyTheme,
  getThemePreference,
  resolveTheme,
  writeStoredThemePreference,
  type ThemePreference,
} from "./theme";
import { ThemeContext } from "./themeContext";
import { useMediaQuery } from "./useMediaQuery";

const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";

function ThemeProviderComponent({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(getThemePreference);
  const systemPrefersDark = useMediaQuery(SYSTEM_THEME_QUERY);
  const theme = resolveTheme(preference, systemPrefersDark);

  // Synchronizes the DOM attribute with the resolved theme (external system).
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((nextPreference: ThemePreference) => {
    setPreference(nextPreference);
    writeStoredThemePreference(nextPreference);
  }, []);

  const toggleTheme = useCallback(() => {
    const nextPreference: ThemePreference = theme === "light" ? "dark" : "light";
    setPreference(nextPreference);
    writeStoredThemePreference(nextPreference);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const ThemeProvider = ThemeProviderComponent;
