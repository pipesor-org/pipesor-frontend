import styles from "./Button.module.css";

/**
 * - `primary`: ink; the main action of a view (one per section at most).
 * - `secondary`: bordered surface; alternative actions.
 * - `ghost`: low emphasis inside dense UI (menus, toolbars).
 * - `link`: inline text action in the accent color (Refresh, View context).
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to the container width. */
  block?: boolean;
  className?: string;
}

/**
 * Class names of a button, for elements that must stay links (router
 * `Link`, external `<a>`) but look and respond like a button.
 */
export function buttonClassName({ variant = "secondary", size = "md", block = false, className }: ButtonStyleOptions = {}): string {
  return [styles.button, styles[variant], variant === "link" ? null : styles[size], block ? styles.block : null, className]
    .filter(Boolean)
    .join(" ");
}
