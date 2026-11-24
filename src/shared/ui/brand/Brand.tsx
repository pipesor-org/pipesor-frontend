import { pipesorLockupDark, pipesorLockupLight } from "../../assets";
import { useTheme } from "../../lib";

/** Pipesor lockup, using the supplied asset for the applied theme (never redrawn or recolored). */
export function Brand({ className }: { className?: string }) {
  const { theme } = useTheme();
  return <img className={className} src={theme === "dark" ? pipesorLockupDark : pipesorLockupLight} alt="Pipesor" />;
}
