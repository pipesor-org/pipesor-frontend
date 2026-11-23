import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

import { ChevronDownIcon } from "../icons";
import styles from "./Field.module.css";

function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Decorative leading icon (e.g. search); the input keeps its own label. */
  icon?: ReactNode;
}

/** Single-line text input sharing the control height, outline and focus halo. */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput({ icon, className, ...props }, ref) {
  if (!icon) return <input ref={ref} className={cx(styles.control, className)} {...props} />;
  return (
    <span className={styles.withIcon}>
      <span className={styles.icon} aria-hidden="true">{icon}</span>
      <input ref={ref} className={cx(styles.control, styles.hasIcon, className)} {...props} />
    </span>
  );
});

/** Native select (keyboard and screen-reader behavior intact) with a token-styled chevron. */
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...props }, ref) {
  return (
    <span className={styles.selectWrap}>
      <select ref={ref} className={cx(styles.control, styles.select, className)} {...props} />
      <ChevronDownIcon className={styles.chevron} aria-hidden="true" />
    </span>
  );
});

/** Multi-line text input. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cx(styles.control, styles.textarea, className)} {...props} />;
});
