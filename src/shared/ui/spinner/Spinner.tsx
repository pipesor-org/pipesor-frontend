import styles from "./Spinner.module.css";

/**
 * Small activity ring in the current text color. Decorative: the control or
 * region that is busy states it in words (`aria-busy`, a status message).
 */
export function Spinner() {
  return <span className={styles.spinner} aria-hidden="true" />;
}
