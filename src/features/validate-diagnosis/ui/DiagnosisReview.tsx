import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import {
  DiagnosisStatusLabel,
  fetchReviews,
  submitReview,
  type Diagnosis,
  type ReviewView,
} from "../../../entities/diagnosis";
import { isApiError, useApiQuery } from "../../../shared/api";
import { useFormatters } from "../../../shared/i18n";
import { Button } from "../../../shared/ui/button";
import { Textarea } from "../../../shared/ui/field";
import { Notice } from "../../../shared/ui/notice";

import styles from "./DiagnosisReview.module.css";

/** Recommendation rejects texts longer than this (after trimming). */
const MAX_TEXT = 1500;

type Mode = "idle" | "confirm" | "reject";
type ErrorKey =
  | "missingCause"
  | "tooLong"
  | "forbidden"
  | "conflict"
  | "stale"
  | "invalid"
  | "network"
  | "generic";

/** Recommendation refuses control characters, so line breaks become spaces. */
function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function errorKeyFor(error: unknown): ErrorKey {
  if (!isApiError(error)) return "generic";
  if (error.kind === "network") return "network";
  if (error.status === 403) return "forbidden";
  if (error.status === 409) return error.code?.toLowerCase() === "diagnosis_stale" ? "stale" : "conflict";
  if (error.status === 400) return "invalid";
  return "generic";
}

interface DiagnosisReviewProps {
  diagnosis: Pick<Diagnosis, "diagnosisId" | "version">;
  /** Called with the server's view after a review is recorded. */
  onReviewed?: (view: ReviewView) => void;
  /** Whether the caller holds OPERATE on the pipeline; the service still enforces it. */
  canReview?: boolean;
}

/**
 * Human validation of an AIOps diagnosis (`validate-diagnosis`).
 *
 * Confirm records `CONFIRMED`; Reject records `CORRECTED` with the actual
 * cause, never overwriting the original hypothesis. Both send the revision the
 * reviewer saw (`expectedRevision`), so a concurrent review answers 409 and the
 * refreshed history is shown instead of silently overwriting it. The reviewer
 * is the session subject; eligibility (OPERATE) is enforced by the service.
 */
export function DiagnosisReview({ diagnosis, onReviewed, canReview = true }: DiagnosisReviewProps) {
  const { t } = useTranslation("operations");
  const { formatTimestamp } = useFormatters();
  const { state, reload, setData } = useApiQuery(`${diagnosis.diagnosisId}:${diagnosis.version}`, (signal) =>
    fetchReviews(diagnosis.diagnosisId, signal),
  );
  const [mode, setMode] = useState<Mode>("idle");
  const [cause, setCause] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<ErrorKey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [recorded, setRecorded] = useState(false);
  /** One key per opened decision form; retries after a failure reuse it. */
  const idempotencyKey = useRef(crypto.randomUUID());
  const firstField = useRef<HTMLTextAreaElement>(null);
  /** Which action button gets focus back once the form closes. */
  const [returnFocus, setReturnFocus] = useState<Exclude<Mode, "idle"> | null>(null);
  const confirmButton = useRef<HTMLButtonElement>(null);
  const rejectButton = useRef<HTMLButtonElement>(null);
  const status = useRef<HTMLParagraphElement>(null);
  const ids = { cause: useId(), causeHint: useId(), notes: useId(), notesHint: useId(), error: useId(), title: useId() };

  useEffect(() => {
    if (mode !== "idle") firstField.current?.focus();
  }, [mode]);

  useEffect(() => {
    if (mode !== "idle" || !returnFocus) return;
    (returnFocus === "confirm" ? confirmButton : rejectButton).current?.focus();
    setReturnFocus(null);
  }, [mode, returnFocus]);

  function open(next: Exclude<Mode, "idle">) {
    idempotencyKey.current = crypto.randomUUID();
    setMode(next);
    setError(null);
    setRecorded(false);
  }

  function close() {
    if (mode !== "idle") setReturnFocus(mode);
    setMode("idle");
    setCause("");
    setNotes("");
    setError(null);
  }

  async function submit(event: FormEvent, view: ReviewView) {
    event.preventDefault();
    const actualCause = normalize(cause);
    const comment = normalize(notes);
    if (mode === "reject" && !actualCause) return setError("missingCause");
    if (actualCause.length > MAX_TEXT || comment.length > MAX_TEXT) return setError("tooLong");

    setSubmitting(true);
    setError(null);
    try {
      const next = await submitReview(diagnosis.diagnosisId, {
        diagnosisVersion: view.diagnosisVersion,
        expectedRevision: view.reviewRevision,
        decision: mode === "reject" ? "CORRECTED" : "CONFIRMED",
        comment: comment || undefined,
        actualCause: mode === "reject" ? actualCause : undefined,
        idempotencyKey: idempotencyKey.current,
      });
      setData(next);
      setMode("idle");
      setCause("");
      setNotes("");
      setRecorded(true);
      onReviewed?.(next);
      requestAnimationFrame(() => status.current?.focus());
    } catch (failure) {
      const key = errorKeyFor(failure);
      setError(key);
      if (key === "conflict") reload();
    } finally {
      setSubmitting(false);
    }
  }

  const view = state.status === "success" ? state.data : null;
  const history = view ? [...view.history].sort((a, b) => b.revision - a.revision) : [];

  return (
    <section className={styles.section} aria-labelledby={ids.title}>
      <div className={styles.heading}>
        <h2 id={ids.title}>{t("review.title")}</h2>
        {view && <DiagnosisStatusLabel status={view.status} />}
      </div>

      {state.status === "loading" && <p className={styles.muted} role="status">{t("review.loading")}</p>}
      {state.status === "error" && (
        <div className={styles.inline}>
          <p role="alert">{t("review.loadError")}</p>
          <Button onClick={reload}>{t("workspace.retry")}</Button>
        </div>
      )}

      {view && (
        <>
          <p ref={status} tabIndex={-1} className={styles.recorded} role="status">
            {recorded ? t("review.recorded") : ""}
          </p>

          {error && mode === "idle" && <p className={styles.error} role="alert">{t(`review.errors.${error}`, { max: MAX_TEXT })}</p>}

          {view.status === "PENDING" && mode === "idle" && (
            <>
              <p className={styles.muted}>{t("review.intro")}</p>
              <p>{t("review.question")}</p>
              {!canReview && <Notice tone="warning">{t("review.errors.forbidden")}</Notice>}
              <div className={styles.actions}>
                <Button ref={confirmButton} variant="primary" disabled={!canReview} onClick={() => open("confirm")}>{t("review.confirm")}</Button>
                <Button ref={rejectButton} disabled={!canReview} onClick={() => open("reject")}>{t("review.reject")}</Button>
              </div>
            </>
          )}

          {mode !== "idle" && (
            <form className={styles.form} onSubmit={(event) => void submit(event, view)} noValidate>
              {mode === "reject" && (
                <div className={styles.field}>
                  <label htmlFor={ids.cause}>
                    {t("review.actualCause")} <span className={styles.muted}>{t("review.required")}</span>
                  </label>
                  <Textarea
                    id={ids.cause}
                    ref={firstField}
                    value={cause}
                    onChange={(event) => setCause(event.target.value)}
                    rows={3}
                    maxLength={MAX_TEXT * 2}
                    required
                    aria-describedby={`${ids.causeHint}${error === "missingCause" ? ` ${ids.error}` : ""}`}
                    aria-invalid={error === "missingCause" || undefined}
                  />
                  <p id={ids.causeHint} className={styles.hint}>{t("review.actualCauseHint")}</p>
                </div>
              )}
              <div className={styles.field}>
                <label htmlFor={ids.notes}>
                  {t("review.notes")} <span className={styles.muted}>{t("review.optional")}</span>
                </label>
                <Textarea
                  id={ids.notes}
                  ref={mode === "confirm" ? firstField : undefined}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  maxLength={MAX_TEXT * 2}
                  aria-describedby={ids.notesHint}
                />
                <p id={ids.notesHint} className={styles.hint}>{t("review.notesHint")}</p>
              </div>
              {error && (
                <p id={ids.error} className={styles.error} role="alert">
                  {t(`review.errors.${error}`, { max: MAX_TEXT })}
                </p>
              )}
              <div className={styles.actions}>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? t("review.submitting") : t(mode === "reject" ? "review.submitReject" : "review.submitConfirm")}
                </Button>
                <Button onClick={close} disabled={submitting}>{t("review.cancel")}</Button>
              </div>
            </form>
          )}

          {history.length > 0 && (
            <div className={styles.history}>
              <h3>{t("review.history")}</h3>
              <ol>
                {history.map((entry) => (
                  <li key={entry.revision}>
                    <p className={styles.entryHead}>
                      <strong>{t(`review.decision.${entry.decision}`)}</strong>
                      <span className={styles.muted}>
                        {t("review.revision", { revision: entry.revision })} ·{" "}
                        <time dateTime={entry.timestamp}>{formatTimestamp(entry.timestamp)}</time>
                      </span>
                    </p>
                    {entry.actualCause && <p>{t("review.reviewedActualCause", { cause: entry.actualCause })}</p>}
                    {entry.comment && <p className={styles.muted}>{entry.comment}</p>}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </>
      )}
    </section>
  );
}
