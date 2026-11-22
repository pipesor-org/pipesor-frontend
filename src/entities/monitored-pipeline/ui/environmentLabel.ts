import type { TFunction } from "i18next";

/** Pipesor operational environments offered at registration (free text in the contract). */
export const OPERATIONAL_ENVIRONMENTS = ["Production", "Staging", "QA", "Development"] as const;
export type OperationalEnvironment = (typeof OPERATIONAL_ENVIRONMENTS)[number];

/** Translates the environments offered at registration; any other stored text is shown as-is. */
export function environmentLabel(t: TFunction<"pipelines">, environment: string | null | undefined): string {
  if (!environment) return t("policy.unspecified");
  const known = OPERATIONAL_ENVIRONMENTS.find((value) => value === environment);
  return known ? t(`environment.${known}`) : environment;
}
