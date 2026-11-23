import { forwardRef, type ButtonHTMLAttributes } from "react";

import { Spinner } from "../spinner";

import { buttonClassName, type ButtonStyleOptions } from "./buttonClassName";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, Omit<ButtonStyleOptions, "className"> {
  /**
   * The action is running: shows a spinner and `aria-busy`, and keeps the
   * button at full strength even while disabled so it reads as "working",
   * not "unavailable". The label should say what is happening.
   */
  loading?: boolean;
}

/**
 * Action button. Defaults to `type="button"` so it never submits a form by
 * accident; hover, press and focus feedback come from the design tokens.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", block = false, loading = false, className, type = "button", children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-busy={loading || undefined}
      className={buttonClassName({ variant, size, block, className })}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
});
