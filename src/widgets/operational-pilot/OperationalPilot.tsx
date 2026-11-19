import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { z } from "zod";

import { useFormatters } from "../../shared/i18n";
import styles from "./OperationalPilot.module.css";

const incidentSchema = z.object({
  id: z.uuid(),
  pipelineId: z.uuid(),
  status: z.enum(["OPEN", "IN_REMEDIATION", "VERIFICATION", "RESOLVED"]),
  summary: z.string(),
  detectedAt: z.iso.datetime({ offset: true }),
  correlationId: z.string(),
});
// shortcut: reject full first pages in the bounded E02 pilot, add pagination for larger scopes.
const incidentPage = z.object({ items: z.array(incidentSchema).max(24), offset: z.literal(0), limit: z.literal(25) });
const pipelinePage = z.object({
  items: z.array(z.object({ id: z.uuid(), fullName: z.string(), workflowName: z.string() })).max(24),
  offset: z.literal(0),
  limit: z.literal(25),
});

export function OperationalPilot({ incidentId }: { incidentId?: string }) {
  const { t } = useTranslation("operations");
  const { formatTimestamp } = useFormatters();
  const [records, setRecords] = useState<(z.infer<typeof incidentSchema> & { workflow?: string })[]>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<"denied" | "unavailable">();

  async function load(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const token = String(new FormData(form).get("pilotToken") ?? "").trim();
    form.reset();
    setRecords(undefined);
    setError(undefined);
    setLoading(true);
    const signal = AbortSignal.timeout(10_000);

    async function read(path: string) {
      const result = await fetch(path, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        credentials: "omit",
        cache: "no-store",
        redirect: "error",
        signal,
      });
      if (!result.ok) throw result;
      return result.json() as Promise<unknown>;
    }

    try {
      if (incidentId) {
        const record = incidentSchema.parse(await read(`/api/v1/incidents/${incidentId}`));
        if (record.id !== incidentId) throw new Error("Incident identity mismatch");
        setRecords([record]);
      } else {
        const pipelines = pipelinePage.parse(await read("/api/v1/pipelines"));
        const pages = await Promise.all(pipelines.items.map(async (pipeline) => {
          const incidents = incidentPage.parse(await read(`/api/v1/pipelines/${pipeline.id}/incidents`));
          if (incidents.items.some((record) => record.pipelineId !== pipeline.id)) {
            throw new Error("Pipeline identity mismatch");
          }
          return incidents.items.filter((record) => record.status !== "RESOLVED")
            .map((record) => ({ ...record, workflow: `${pipeline.fullName} · ${pipeline.workflowName}` }));
        }));
        setRecords(pages.flat());
      }
    } catch (failure) {
      setError(failure instanceof Response && [401, 403, 404].includes(failure.status) ? "denied" : "unavailable");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={styles.panel} aria-label={t("pilot.title")}>
      <p>{t("pilot.description")}</p>
      <form onSubmit={load}>
        <label>{t("pilot.token")}
          <input name="pilotToken" type="password" autoComplete="off" required maxLength={4096} disabled={loading} />
        </label>
        <button type="submit" disabled={loading}>{t("pilot.load")}</button>
      </form>
      {loading && <p role="status">{t("pilot.loading")}</p>}
      {error && <p role="alert">{t(`pilot.${error}`)}</p>}
      {records?.length === 0 && <p role="status">{t("pilot.empty")}</p>}
      {records?.map((record) => (
        <article key={record.id}>
          <h2>{record.workflow ?? t("workspace.details")}</h2>
          {!incidentId && <Link to={`/incidents/${record.id}?pilot=1&from=active`}>{record.id}</Link>}
          <p>{record.summary}</p>
          <p>{t(`pilot.status.${record.status}`)} · <time dateTime={record.detectedAt}>{formatTimestamp(record.detectedAt)}</time></p>
          {incidentId && <p>{t("diagnosticDemo.correlation")} <code>{record.correlationId}</code></p>}
          {incidentId && <p>{t("pilot.diagnosisBlocked")}</p>}
        </article>
      ))}
    </section>
  );
}
