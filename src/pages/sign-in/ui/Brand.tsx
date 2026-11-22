import { pipesorLockupDark, pipesorLockupLight } from "../../../shared/assets";
import { useTheme } from "../../../shared/lib";

import styles from "./SignIn.module.css";

/** Pipesor lockup, using the supplied asset for the applied theme. */
export function Brand() {
  const { theme } = useTheme();
  return <img className={styles.lockup} src={theme === "dark" ? pipesorLockupDark : pipesorLockupLight} alt="Pipesor" />;
}
