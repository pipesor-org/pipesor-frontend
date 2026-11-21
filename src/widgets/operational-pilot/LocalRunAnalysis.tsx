import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import styles from "./OperationalPilot.module.css";

declare const __PIPESOR_LOCAL_CAPTURE__: boolean;
export const localRunAnalysisEnabled = import.meta.env.DEV && __PIPESOR_LOCAL_CAPTURE__;

const externalId = z.string().regex(/^[1-9]\d*$/);
const capturePhase = z.enum(["ACCEPTED", "PREPARED", "PUBLISHED", "BLOCKED"]);
const candidateSchema = z.object({
  repositoryId: externalId,
  repository: z.string().min(1),
  workflowId: externalId,
  runId: externalId,
  attempt: z.number().int().positive(),
  conclusion: z.enum(["failure", "timed_out"]),
  phase: capturePhase.nullish(),
});
const analysisSchema = z.object({
  runId: externalId,
  attempt: z.number().int().positive(),
  phase: capturePhase,
});
type Candidate = z.infer<typeof candidateSchema>;

async function request(path: string, token: string, method: "GET" | "POST") {
  const response = await fetch(path, {
    method,
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
    credentials: "omit",
    redirect: "error",
    signal: AbortSignal.timeout(100_000),
  });
  if (!response.ok) throw response;
  return response.json() as Promise<unknown>;
}

async function errorKey(error: unknown) {
  if (error instanceof Response) {
    if ([401, 403].includes(error.status)) return "denied";
    if (error.status === 422) return "unsupported";
    if (error.status === 409) {
      const data: unknown = await error.json().catch(() => undefined);
      if (z.object({ code: z.literal("CONNECTION_REQUIRED") }).safeParse(data).success) return "connectionRequired";
      return "conflict";
    }
  }
  return "unavailable";
}

export function LocalRunAnalysis() {
  const { t } = useTranslation("operations");
  const [token, setToken] = useState("");
  const [candidate, setCandidate] = useState<Candidate>();
  const [phase, setPhase] = useState<z.infer<typeof analysisSchema>["phase"]>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Awaited<ReturnType<typeof errorKey>>>();

  async function discover(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const credential = String(new FormData(form).get("githubToken") ?? "").trim();
    form.reset();
    setToken("");
    setCandidate(undefined);
    setPhase(undefined);
    setError(undefined);
    setBusy(true);
    try {
      const run = candidateSchema.parse(await request("/api/v1/github/local-analysis", credential, "GET"));
      setToken(credential);
      setCandidate(run);
      setPhase(run.phase ?? undefined);
    } catch (failure) {
      setError(await errorKey(failure));
    } finally {
      setBusy(false);
    }
  }

  async function analyze() {
    if (!candidate || !token || busy) return;
    const { repositoryId, workflowId, runId, attempt } = candidate;
    setBusy(true);
    setError(undefined);
    try {
      const result = analysisSchema.parse(await request(
        `/api/v1/github/repositories/${repositoryId}/workflows/${workflowId}/runs/${runId}/attempts/${attempt}/analysis`,
        token, "POST",
      ));
      if (result.runId !== runId || result.attempt !== attempt) throw new Error("Run identity mismatch");
      setPhase(result.phase);
    } catch (failure) {
      const reason = await errorKey(failure);
      if (reason === "denied" || reason === "connectionRequired") {
        setToken("");
        setCandidate(undefined);
        setPhase(undefined);
      }
      setError(reason);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.panel} aria-label={t("capture.title")}>
      <h2>{t("capture.title")}</h2>
      <form onSubmit={discover}>
        <label>{t("capture.token")}
          <input name="githubToken" type="password" autoComplete="off" required maxLength={8192} disabled={busy} />
        </label>
        <button type="submit" disabled={busy}>{t("capture.discover")}</button>
      </form>
      {candidate && (
        <article>
          <h3>{candidate.repository}</h3>
          <p>{t("capture.run", candidate)}</p>
          <button type="button" onClick={() => void analyze()} disabled={busy || phase === "PUBLISHED"}>
            {t("capture.analyze")}
          </button>
        </article>
      )}
      {busy && <p role="status">{t("capture.loading")}</p>}
      {phase && <p role="status">{t(`capture.phase.${phase}`)}</p>}
      {error && <p role="alert">{t(`capture.${error}`)}</p>}
    </section>
  );
}
