import { forwardRef, type ButtonHTMLAttributes } from "react";

import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

/**
 * Action button with the two treatments used across Pipesor: a filled accent
 * `primary` for the main action of a section and a bordered `secondary`.
 * Defaults to `type="button"` so it never submits a form by accident.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", className, type = "button", ...props },
  ref,
) {
  return <button ref={ref} type={type} className={`${styles.button} ${styles[variant]}${className ? ` ${className}` : ""}`} {...props} />;
});
