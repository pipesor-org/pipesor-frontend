import { readStoredValue, writeStoredValue } from "./storage";

const THEME_STORAGE_KEY = "pipesor.theme";

/** Theme actually applied to the document. */
export type Theme = "light" | "dark";

/** User intent: an explicit theme, or follow the operating system. */
export type ThemePreference = Theme | "system";

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "system" || isTheme(value);
}

function readStoredThemePreference(): ThemePreference | null {
  const stored = readStoredValue(THEME_STORAGE_KEY);
  return isThemePreference(stored) ? stored : null;
}

/** Resolves the theme to apply. `"system"` follows the OS color scheme. */
export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): Theme {
  if (preference === "system") {
    return systemPrefersDark ? "dark" : "light";
  }
  return preference;
}

/** Stored preference, defaulting to `"system"` when absent or invalid. */
export function getThemePreference(): ThemePreference {
  return readStoredThemePreference() ?? "system";
}

/**
 * Theme to apply before React mounts. Must resolve through the same inputs as
 * the provider's initial state so the first paint matches the first render.
 */
export function getPreferredTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return resolveTheme(getThemePreference(), prefersDark);
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

/** Persists an explicit preference. Call only after user interaction. */
export function writeStoredThemePreference(preference: ThemePreference): void {
  writeStoredValue(THEME_STORAGE_KEY, preference);
}
