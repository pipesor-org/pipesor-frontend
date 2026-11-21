import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import styles from "./OperationalPilot.module.css";

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

const sessionKey = "pipesor.local-session";

function pilotSession() {
  try {
    const parameters = new URLSearchParams(window.location.hash.slice(1));
    const bootstrap = parameters.get("local-session");
    if (bootstrap && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(bootstrap)) {
      window.sessionStorage.setItem(sessionKey, bootstrap);
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    }
    return window.sessionStorage.getItem(sessionKey) ?? "";
  } catch {
    return "";
  }
}

export function LocalRunAnalysis() {
  const { t } = useTranslation("operations");
  const [token, setToken] = useState(pilotSession);
  const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => {
    let current = true;
    if (token) {
      void request("/api/v1/github/local-session", token, "GET").then((value) => {
        if (current) setAuthenticated(z.object({ authenticated: z.literal(true) }).safeParse(value).success);
      }).catch((failure: unknown) => {
        if (!current) return;
        setAuthenticated(false);
        if (failure instanceof Response && failure.status === 401) {
          setToken("");
          window.sessionStorage.removeItem(sessionKey);
        }
      });
    }
    return () => { current = false; };
  }, [token]);
  const [candidate, setCandidate] = useState<Candidate>();
  const [phase, setPhase] = useState<z.infer<typeof analysisSchema>["phase"]>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Awaited<ReturnType<typeof errorKey>>>();

  async function discover(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const credential = token || String(new FormData(form).get("githubToken") ?? "").trim();
    form.reset();
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
        if (failure instanceof Response && failure.status === 401) {
          setToken("");
          setAuthenticated(false);
          window.sessionStorage.removeItem(sessionKey);
        }
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
      {authenticated && <p>{t("capture.sessionActive")}</p>}
      <form onSubmit={discover}>
        {!token && <label>{t("capture.token")}
          <input name="githubToken" type="password" autoComplete="off" required maxLength={8192} disabled={busy} />
        </label>}
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
