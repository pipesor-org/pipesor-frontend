import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { AppLayout } from "../../shared/ui/app-layout";
import { AppSidebar } from "../../widgets/app-sidebar";
import { diagnosticOutputSchema, reviewSchema, type DiagnosticOutput, type ReviewView } from "./diagnosticOutput";
import { DiagnosticReview } from "./DiagnosticReview";
import styles from "./DiagnosticDemoPage.module.css";

export function DiagnosticDemoPage() {
  const requestedId = new URLSearchParams(window.location.search).get("review");

  return (
    <AppLayout sidebar={<AppSidebar />}>
      <DiagnosticPanel key={requestedId} requestedId={requestedId} />
    </AppLayout>
  );
}

export function DiagnosticPanel({ requestedId, replay = false }: {
  requestedId: string | null;
  replay?: boolean;
}) {
  const { t } = useTranslation("operations");
  const [output, setOutput] = useState<DiagnosticOutput>();
  const [review, setReview] = useState<ReviewView>();
  const [reviewToken, setReviewToken] = useState("");
  const reviewUrl = requestedId && /^[0-9a-f-]{36}$/.test(requestedId)
    ? `/local-demo/v1/diagnoses/${requestedId}/review` : undefined;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<"unauthenticated" | "unavailable" | "invalid">();

  async function readDiagnosis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (replay && !reviewUrl) return;
    const token = String(new FormData(event.currentTarget).get("demoToken") ?? "").trim();
    setOutput(undefined);
    setReview(undefined);
    setReviewToken("");
    setError(undefined);
    setLoading(true);
    try {
      const response = await fetch(reviewUrl ?? "/local-demo/v1/diagnosis", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
        credentials: "omit",
        redirect: "error",
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        setError(response.status === 401 ? "unauthenticated" : "unavailable");
        return;
      }
      const body: unknown = await response.json().catch(() => undefined);
      if (reviewUrl) {
        const result = reviewSchema.safeParse(body);
        if (!result.success || result.data.diagnosticId !== requestedId) {
          setError("invalid");
          return;
        }
        setOutput(result.data.original);
        setReview(result.data);
        setReviewToken(token);
        return;
      }
      const result = diagnosticOutputSchema.safeParse(body);
      if (result.success) setOutput(result.data);
      else setError("invalid");
    } catch {
      setError("unavailable");
    } finally {
      setLoading(false);
    }
  }

  if (replay && !reviewUrl) return <p role="alert">{t("diagnosticDemo.invalid")}</p>;

  return (
    <article className={styles.panel}>
      {replay ? (
        <>
          <h2>{t("diagnosticDemo.replayTitle")}</h2>
          <p>{t("diagnosticDemo.replayDescription")}</p>
        </>
      ) : (
        <>
          <h1>{t("diagnosticDemo.title")}</h1>
          <p>{t("diagnosticDemo.description")}</p>
        </>
      )}
      <form onSubmit={readDiagnosis}>
        <label>
          {t("diagnosticDemo.choose")}
          <input name="demoToken" type="password" required maxLength={128}
            autoComplete="off" disabled={loading} />
        </label>
        <button type="submit" disabled={loading}>{t("diagnosticDemo.load")}</button>
      </form>
      {loading && <p role="status">{t("diagnosticDemo.loading")}</p>}
      {error && <p role="alert">{t(`diagnosticDemo.${error}`)}</p>}
      {output && (
        <div tabIndex={0} aria-label={t("diagnosticDemo.result")}>
          {review && <h2>{t("diagnosticReview.generated")}</h2>}
          <h2>{t("diagnosticDemo.cause")}</h2>
          <p>{output.hypothesis.probableCause}</p>
          <h2>{t("diagnosticDemo.recommendation")}</h2>
          <p>{output.hypothesis.recommendation}</p>
          <h2>{t("diagnosticDemo.limitations")}</h2>
          <p>{output.hypothesis.limitations}</p>
          <h2>{t("diagnosticDemo.evidence")}</h2>
          <p>{t("diagnosticDemo.correlation")} <code>{output.correlationId}</code></p>
          <p>{t("diagnosticDemo.incident")} <code>{output.incidentId}</code></p>
          <p>{t("diagnosticDemo.context")} <code>{output.contextId}</code></p>
          <p>{t("diagnosticDemo.execution")} <code>{output.executionId}</code></p>
          <ul>
            {output.evidence.map((signal) => (
              <li key={signal.evidenceId}>
                <code>{signal.evidenceId}</code> · {signal.stage}
                <p>{t("diagnosticDemo.origin")} <code>{signal.originContextId}</code></p>
                <pre>{signal.content}</pre>
              </li>
            ))}
          </ul>
          <h2>{t("diagnosticDemo.sources")}</h2>
          {output.sources.length ? (
            <ul>
              {output.sources.map((source) => (
                <li key={source.chunkId}>
                  <code>{source.provenance}</code>
                  <p>{t("diagnosticDemo.document")} <code>{source.documentId}</code></p>
                  <p>{t("diagnosticDemo.chunk")} <code>{source.chunkId}</code></p>
                </li>
              ))}
            </ul>
          ) : <p>{t("diagnosticDemo.noSources")}</p>}
          {review && reviewUrl && (
            <DiagnosticReview url={reviewUrl} token={reviewToken} view={review}
              onUpdate={setReview} onDenied={() => {
                setOutput(undefined);
                setReview(undefined);
                setReviewToken("");
                setError("unavailable");
              }} />
          )}
        </div>
      )}
    </article>
  );
}
