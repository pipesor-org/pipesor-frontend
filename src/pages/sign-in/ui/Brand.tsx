import { Brand as Lockup } from "../../../shared/ui/brand";

import styles from "./SignIn.module.css";

/** Pipesor lockup at the sign-in card's size. */
export function Brand() {
  return <Lockup className={styles.lockup} />;
}
