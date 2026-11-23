import { forwardRef, type ButtonHTMLAttributes } from "react";

import { buttonClassName, type ButtonStyleOptions } from "./buttonClassName";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, Omit<ButtonStyleOptions, "className"> {}

/**
 * Action button. Defaults to `type="button"` so it never submits a form by
 * accident; hover, press and focus feedback come from the design tokens.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", block = false, className, type = "button", ...props },
  ref,
) {
  return <button ref={ref} type={type} className={buttonClassName({ variant, size, block, className })} {...props} />;
});
