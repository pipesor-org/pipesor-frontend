import { useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { type z } from "zod";

import { ReviewHistory, reviewDecision, reviewSchema, type ReviewView } from "../../entities/diagnosis";

export function DiagnosticReview({ url, token, view, onUpdate, onDenied }: {
  url: string;
  token: string;
  view: ReviewView;
  onUpdate: (view: ReviewView) => void;
  onDenied: () => void;
}) {
  const { t } = useTranslation("operations");
  const [choice, setChoice] = useState<z.infer<typeof reviewDecision>>("CONFIRMED");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"saved" | "failed" | "conflict">();
  const retry = useRef<{ body: string; key: string }>(undefined);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const inputs = new FormData(form);
    const body = JSON.stringify({
      diagnosisVersion: view.diagnosisVersion,
      expectedRevision: view.reviewRevision,
      decision: choice,
      comment: String(inputs.get("comment") ?? "").trim(),
      actualCause: choice === "CORRECTED" ? String(inputs.get("actualCause") ?? "").trim() : null,
      correctedRecommendation: choice === "CORRECTED"
        ? String(inputs.get("correctedRecommendation") ?? "").trim() || null : null,
    });
    if (retry.current?.body !== body) retry.current = { body, key: crypto.randomUUID() };
    setSaving(true);
    setStatus(undefined);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json",
          "Idempotency-Key": retry.current.key },
        body,
        cache: "no-store",
        credentials: "omit",
        redirect: "error",
        signal: AbortSignal.timeout(10_000),
      });
      if (response.status === 401 || response.status === 404) {
        onDenied();
        return;
      }
      if (!response.ok) {
        setStatus(response.status === 409 ? "conflict" : "failed");
        return;
      }
      const result = reviewSchema.safeParse(await response.json());
      if (!result.success || result.data.diagnosticId !== view.diagnosticId ||
          result.data.diagnosisVersion !== view.diagnosisVersion) {
        setStatus("failed");
        return;
      }
      retry.current = undefined;
      form.reset();
      onUpdate(result.data);
      setStatus("saved");
    } catch {
      setStatus("failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2>{t("diagnosticReview.title")}</h2>
      <p>{t("diagnosticReview.version", { version: view.diagnosisVersion })}</p>
      <p role="status">{t(`diagnosticReview.${view.status}`)}</p>
      <form onSubmit={submit}>
        <fieldset disabled={saving || status === "conflict"}>
          <legend>{t("diagnosticReview.newReview")}</legend>
          <label>{t("diagnosticReview.decision")}
            <select value={choice} onChange={(event) => setChoice(reviewDecision.parse(event.currentTarget.value))}>
              {reviewDecision.options.map((value) => (
                <option key={value} value={value}>{t(`diagnosticReview.${value}`)}</option>
              ))}
            </select>
          </label>
          <label>{t("diagnosticReview.justification")}
            <input name="comment" required maxLength={1500} />
          </label>
          {choice === "CORRECTED" && <>
            <label>{t("diagnosticReview.actualCause")}
              <input name="actualCause" required maxLength={1500} />
            </label>
            <label>{t("diagnosticReview.correctedRecommendation")}
              <input name="correctedRecommendation" maxLength={1500} />
            </label>
          </>}
          <button type="submit">{t("diagnosticReview.save")}</button>
        </fieldset>
      </form>
      {status && <p role={status === "saved" ? "status" : "alert"}>{t(`diagnosticReview.${status}`)}</p>}
      <ReviewHistory view={view} />
    </section>
  );
}
