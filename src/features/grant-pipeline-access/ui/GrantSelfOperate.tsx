import { useState } from "react";
import { useTranslation } from "react-i18next";

import { fetchSelfPrincipalRef } from "../../../entities/github-access";
import { invalidatePipeline } from "../../../entities/monitored-pipeline";
import { isApiError } from "../../../shared/api";
import { Button } from "../../../shared/ui/button";

import { grantCapability } from "../api/grant";
import styles from "./GrantSelfOperate.module.css";

/**
 * `grant-pipeline-access`: lets a CONFIGURE holder grant themselves OPERATE,
 * which incident lifecycle and diagnosis review require (CONFIGURE does not
 * imply it, ADR-020). The principal is the caller as reported by Ingestion.
 */
export function GrantSelfOperate({ pipelineId, onGranted }: { pipelineId: string; onGranted: () => void }) {
  const { t } = useTranslation("pipelines");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<"forbidden" | "generic" | null>(null);

  async function grant() {
    setBusy(true);
    setError(null);
    try {
      const principal = await fetchSelfPrincipalRef();
      await grantCapability(pipelineId, principal, "OPERATE");
      invalidatePipeline(pipelineId);
      onGranted();
    } catch (failure) {
      setError(isApiError(failure) && (failure.status === 403 || failure.status === 404) ? "forbidden" : "generic");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.root}>
      <p>{t("access.grantSelfText")}</p>
      <Button variant="primary" onClick={() => void grant()} disabled={busy}>
        {busy ? t("access.granting") : t("access.grantSelf")}
      </Button>
      {error && <p className={styles.error} role="alert">{t(`access.grantError.${error}`)}</p>}
    </div>
  );
}
