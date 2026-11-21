import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { ReviewHistory, reviewSchema, type ReviewView } from "../../../entities/diagnosis";
import styles from "./IncidentWorkspace.module.css";

export function ReplayDiagnosis({ incidentId, reviewId }: { incidentId: string; reviewId: string }) {
  const { t } = useTranslation("operations");
  const [view, setView] = useState<ReviewView>();
  const [error, setError] = useState<"denied" | "unavailable" | "invalid">();
  const [loading, setLoading] = useState(false);

  async function load(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const token = String(new FormData(form).get("demoToken") ?? "").trim();
    form.reset();
    setView(undefined);
    setError(undefined);
    setLoading(true);
    try {
      const response = await fetch(`/local-demo/v1/diagnoses/${reviewId}/review`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        credentials: "omit",
        redirect: "error",
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        setError([401, 403, 404].includes(response.status) ? "denied" : "unavailable");
        return;
      }
      const result = reviewSchema.safeParse(await response.json().catch(() => undefined));
      if (!result.success || result.data.diagnosticId !== reviewId || result.data.original.incidentId !== incidentId) {
        setError("invalid");
        return;
      }
      setView(result.data);
    } catch {
      setError("unavailable");
    } finally {
      setLoading(false);
    }
  }

  const output = view?.original;

  return (
    <>
      <form className={styles.access} onSubmit={load}>
        <label>
          {t("diagnosticDemo.choose")}
          <input name="demoToken" type="password" required maxLength={128} autoComplete="off" disabled={loading} />
        </label>
        <button type="submit" disabled={loading}>{t("diagnosticDemo.load")}</button>
      </form>
      {loading && <p role="status">{t("diagnosticDemo.loading")}</p>}
      {error && <p role="alert">{t(error === "denied" ? "workspace.denied" : `diagnosticDemo.${error}`)}</p>}
      {output && view && (
        <div className={styles.columns}>
          <article className={styles.surface}>
            <section>
              <p className={styles.eyebrow}>{t("workspace.inference")}</p>
              <h2>{t("diagnosticDemo.cause")}</h2>
              <p>{output.hypothesis.probableCause}</p>
              <h3>{t("diagnosticDemo.limitations")}</h3>
              <p>{output.hypothesis.limitations}</p>
            </section>
            <section>
              <h2>{t("workspace.evidence")}</h2>
              <ul className={styles.evidence}>
                {output.evidence.map((signal) => (
                  <li key={signal.evidenceId}>
                    <p>{signal.stage} · <code>{signal.evidenceId}</code></p>
                    <p>{t("diagnosticDemo.origin")} <code>{signal.originContextId}</code></p>
                    {signal.sourceLocator && (
                      <p>{t("diagnosticDemo.sourceLocator")} <code style={{ overflowWrap: "anywhere" }}>{signal.sourceLocator}</code></p>
                    )}
                    <pre>{signal.content}</pre>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2>{t("workspace.recommendation")}</h2>
              <p>{output.hypothesis.recommendation}</p>
              <h3>{t("diagnosticDemo.sources")}</h3>
              {output.sources.length ? <ul>
                {output.sources.map((source) => <li key={source.chunkId}>
                  <code>{source.provenance}</code>
                  <p>{t("diagnosticDemo.document")} <code>{source.documentId}</code></p>
                  <p>{t("diagnosticDemo.chunk")} <code>{source.chunkId}</code></p>
                </li>)}
              </ul> : <p>{t("diagnosticDemo.noSources")}</p>}
            </section>
            <section>
              <h2>{t("workspace.validation")}</h2>
              <p>{t("diagnosticReview.version", { version: view.diagnosisVersion })}</p>
              <p>{t(`diagnosticReview.${view.status}`)}</p>
              <ReviewHistory view={view} />
            </section>
          </article>
          <aside className={styles.rail} aria-label={t("workspace.details")}>
            <section>
              <h2>{t("workspace.details")}</h2>
              <dl>
                <div><dt>{t("diagnosticDemo.execution")}</dt><dd><code>{output.executionId}</code></dd></div>
                <div><dt>{t("diagnosticDemo.context")}</dt><dd><code>{output.contextId}</code></dd></div>
                <div><dt>{t("diagnosticDemo.correlation")}</dt><dd><code>{output.correlationId}</code></dd></div>
              </dl>
              <p>{t("workspace.operationalUnavailable")}</p>
            </section>
          </aside>
        </div>
      )}
    </>
  );
}
