import { createContext, useContext } from "react";

import type { Theme, ThemePreference } from "./theme";

export interface ThemeContextValue {
  /** The theme currently applied to the document. */
  theme: Theme;
  /** Sets and persists an explicit preference. */
  setTheme: (preference: ThemePreference) => void;
  /** Switches to the opposite of the applied theme and persists it. */
  toggleTheme: () => void;
}

/**
 * Kept in its own module (separate from `ThemeProvider`) so that the provider
 * file only exports a component, which React Fast Refresh requires.
 */
export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
